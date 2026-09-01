import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ensureDeliveryTables, verifyDeliverySession, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function genId(p='da'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
const FLOW: Record<string,string[]> = {
  'ASSIGNED':['ACCEPTED','CANCELLED'],
  'ACCEPTED':['PICKED_UP','CANCELLED'],
  'PICKED_UP':['ON_THE_WAY','CANCELLED'],
  'ON_THE_WAY':['ARRIVED','CANCELLED'],
  'ARRIVED':['DELIVERED','CANCELLED'],
};
export async function POST(req:NextRequest){
  const sql=getSql(); await ensureDeliveryTables();
  const body=await req.json();
  const { order_id, delivery_partner_id, action, status } = body;
  const admin=await verifyAdminSession(req);
  const delivery=await verifyDeliverySession(req);
  // Admin assigns
  if(body.action==='assign'){
    if(!admin) return NextResponse.json({error:'Admin only'},{status:401});
    if(!order_id || !delivery_partner_id) return NextResponse.json({error:'order_id and delivery_partner_id required'},{status:400});
    const partner:any[] = await sql`SELECT id, is_active, is_online FROM delivery_partners WHERE id=${delivery_partner_id} LIMIT 1`;
    if(!partner.length || !partner[0].is_active) return NextResponse.json({error:'Partner not active'},{status:400});
    const order:any[] = await sql`SELECT id, order_status FROM orders WHERE id=${order_id} LIMIT 1`;
    if(!order.length) return NextResponse.json({error:'Order not found'},{status:404});
    const exists:any[] = await sql`SELECT id FROM delivery_assignments WHERE order_id=${order_id} LIMIT 1`;
    if(exists.length) return NextResponse.json({error:'Already assigned'},{status:409});
    const id=genId('da');
    await sql`INSERT INTO delivery_assignments (id, order_id, delivery_partner_id, status) VALUES (${id}, ${order_id}, ${delivery_partner_id}, 'ASSIGNED')`;
    await sql`UPDATE orders SET order_status='READY', updated_at=NOW() WHERE id=${order_id}`;
    // Generate OTP for delivery verification (6 digits)
    const otp = Math.floor(100000+Math.random()*900000).toString();
    const crypto = await import('crypto');
    const hash=crypto.createHash('sha256').update(otp).digest('hex');
    const otpId=genId('otp');
    await sql`INSERT INTO delivery_otps (id, order_id, assignment_id, otp_hash, expires_at, attempts, verified) VALUES (${otpId}, ${order_id}, ${id}, ${hash}, NOW()+INTERVAL '1 hour', 0, false) ON CONFLICT DO NOTHING`;
    // For testing, log OTP to console (in production, send via SMS)
    console.log(`OTP for order ${order_id}: ${otp}`);
    return NextResponse.json({success:true, assignment_id:id, otp}); // OTP returned for admin testing; remove in prod
  }
  // Delivery partner status transitions
  if(['accept','picked','ontheway','arrived','delivered','cancel'].includes(action)){
    if(!delivery) return NextResponse.json({error:'Delivery auth required'},{status:401});
    if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
    const rows:any[] = await sql`SELECT da.*, o.order_status FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.order_id=${order_id} AND da.delivery_partner_id=${delivery.id} LIMIT 1`;
    if(!rows.length) return NextResponse.json({error:'Not assigned to you'},{status:403});
    const cur=rows[0].status;
    let next='';
    if(action==='accept' && cur==='ASSIGNED') next='ACCEPTED';
    else if(action==='picked' && cur==='ACCEPTED') next='PICKED_UP';
    else if(action==='ontheway' && cur==='PICKED_UP') next='ON_THE_WAY';
    else if(action==='arrived' && cur==='ON_THE_WAY') next='ARRIVED';
    else if(action==='delivered' && cur==='ARRIVED') {
      // Must verify OTP first
      const otpRows:any[] = await sql`SELECT verified FROM delivery_otps WHERE order_id=${order_id} ORDER BY created_at DESC LIMIT 1`;
      if(!otpRows.length || !otpRows[0].verified) return NextResponse.json({error:'OTP not verified'},{status:400});
      next='DELIVERED';
    }
    else if(action==='cancel' && ['ASSIGNED','ACCEPTED','PICKED_UP','ON_THE_WAY','ARRIVED'].includes(cur)) next='CANCELLED';
    else return NextResponse.json({error:`Invalid transition ${cur} -> ${action}`},{status:400});
    await sql`UPDATE delivery_assignments SET status=${next}, updated_at=NOW() WHERE order_id=${order_id}`;
    if(next==='DELIVERED') await sql`UPDATE orders SET order_status='DELIVERED', updated_at=NOW() WHERE id=${order_id}`;
    else if(next==='CANCELLED') await sql`UPDATE orders SET order_status='CANCELLED' WHERE id=${order_id}`;
    else await sql`UPDATE orders SET order_status=${next==='ACCEPTED'?'CONFIRMED':next}, updated_at=NOW() WHERE id=${order_id}`;
    return NextResponse.json({success:true, status:next});
  }
  // Generic status update via admin
  if(status && admin){
    if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
    const cur:any[] = await sql`SELECT status FROM delivery_assignments WHERE order_id=${order_id} LIMIT 1`;
    if(!cur.length) return NextResponse.json({error:'Not assigned'},{status:404});
    const allowed=FLOW[cur[0].status]||[];
    if(!allowed.includes(status)) return NextResponse.json({error:`Cannot ${cur[0].status} -> ${status}`},{status:400});
    await sql`UPDATE delivery_assignments SET status=${status}, updated_at=NOW() WHERE order_id=${order_id}`;
    return NextResponse.json({success:true});
  }
  return NextResponse.json({error:'Invalid action'},{status:400});
}
export async function GET(req:NextRequest){
  const sql=getSql(); await ensureDeliveryTables();
  const url=new URL(req.url);
  const order_id=url.searchParams.get('order_id');
  if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
  const admin=await verifyAdminSession(req);
  const delivery=await verifyDeliverySession(req);
  const rows:any[] = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status, o.order_status, dp.name as partner_name, dp.phone as partner_phone FROM delivery_assignments da JOIN orders o ON o.id=da.order_id LEFT JOIN delivery_partners dp ON dp.id=da.delivery_partner_id WHERE da.order_id=${order_id} LIMIT 1`;
  if(!rows.length) return NextResponse.json({assignment:null});
  const a=rows[0];
  // Privacy: customer can only see own order
  const customerId = req.cookies.get('customer_session')?.value?.split('_')[1];
  if(customerId){
    const order:any[] = await sql`SELECT user_id FROM orders WHERE id=${order_id} LIMIT 1`;
    if(order.length && order[0].user_id !== customerId && !admin && !(delivery && delivery.id===a.delivery_partner_id)) return NextResponse.json({error:'Forbidden'},{status:403});
  } else if(!admin && !delivery) {
    // Allow customer tracking via order_id without auth? For now require admin or delivery or owner
    // If no session, allow but only show limited info (no phone)
  }
  if(delivery && a.delivery_partner_id!==delivery.id && !admin) return NextResponse.json({error:'Forbidden'},{status:403});
  a.items = await sql`SELECT * FROM order_items WHERE order_id=${order_id}`;
  const otp:any[] = await sql`SELECT verified FROM delivery_otps WHERE order_id=${order_id} ORDER BY created_at DESC LIMIT 1`;
  a.otp_verified = otp.length ? otp[0].verified : false;
  return NextResponse.json({assignment:a});
}
