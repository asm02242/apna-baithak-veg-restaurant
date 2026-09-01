import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ensureDeliveryTables, verifyDeliverySession, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function genId(){ return `loc-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
export async function POST(req:NextRequest){
  const delivery=await verifyDeliverySession(req);
  if(!delivery) return NextResponse.json({error:'Delivery auth'},{status:401});
  const {order_id, latitude, longitude} = await req.json();
  if(!order_id|| latitude==null|| longitude==null) return NextResponse.json({error:'order_id, latitude, longitude required'},{status:400});
  const sql=getSql(); await ensureDeliveryTables();
  const rows:any[] = await sql`SELECT da.id as assignment_id, da.status FROM delivery_assignments da WHERE da.order_id=${order_id} AND da.delivery_partner_id=${delivery.id} LIMIT 1`;
  if(!rows.length) return NextResponse.json({error:'Not assigned'},{status:403});
  if(!['PICKED_UP','ON_THE_WAY','ARRIVED'].includes(rows[0].status)) return NextResponse.json({error:'Location only when PICKED_UP/ON_THE_WAY/ARRIVED'},{status:400});
  // Throttle 10s
  const last:any[] = await sql`SELECT updated_at FROM delivery_locations WHERE assignment_id=${rows[0].assignment_id} ORDER BY updated_at DESC LIMIT 1`;
  if(last.length){
    const diff=Date.now()-new Date(last[0].updated_at).getTime();
    if(diff<10000) return NextResponse.json({success:true, throttled:true});
  }
  const id=genId();
  await sql`INSERT INTO delivery_locations (id, assignment_id, partner_id, order_id, latitude, longitude, updated_at) VALUES (${id}, ${rows[0].assignment_id}, ${delivery.id}, ${order_id}, ${latitude}, ${longitude}, NOW()) ON CONFLICT (id) DO NOTHING`;
  // Keep only last 50 per assignment
  await sql`DELETE FROM delivery_locations WHERE id IN (SELECT id FROM delivery_locations WHERE assignment_id=${rows[0].assignment_id} ORDER BY updated_at DESC OFFSET 50)`;
  return NextResponse.json({success:true});
}
export async function GET(req:NextRequest){
  const url=new URL(req.url);
  const order_id=url.searchParams.get('order_id');
  if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
  const sql=getSql(); await ensureDeliveryTables();
  const delivery=await verifyDeliverySession(req);
  const admin=await verifyAdminSession(req);
  const customerId=req.cookies.get('customer_session')?.value?.split('_')[1]||null;
  // Verify access: admin can see all, delivery can see own, customer can see own order
  const order:any[] = await sql`SELECT user_id, order_status FROM orders WHERE id=${order_id} LIMIT 1`;
  if(!order.length) return NextResponse.json({error:'Order not found'},{status:404});
  const assignment:any[] = await sql`SELECT * FROM delivery_assignments WHERE order_id=${order_id} LIMIT 1`;
  if(!assignment.length) return NextResponse.json({location:null, status:null});
  const a=assignment[0];
  const isActive=['PICKED_UP','ON_THE_WAY','ARRIVED'].includes(a.status);
  // Privacy checks
  if(customerId){
    if(order[0].user_id!==customerId && !admin && !(delivery&&delivery.id===a.delivery_partner_id)) return NextResponse.json({error:'Forbidden'},{status:403});
    if(!isActive) return NextResponse.json({location:null, status:a.status, active:false});
  } else if(delivery){
    if(a.delivery_partner_id!==delivery.id && !admin) return NextResponse.json({error:'Forbidden'},{status:403});
  } else if(!admin){
    // Guest customer tracking via order_id? Allow if order is assigned and active, but hide precise if not active
    if(!isActive) return NextResponse.json({location:null, status:a.status, active:false});
  }
  if(!isActive) return NextResponse.json({location:null, status:a.status, active:false});
  const loc:any[] = await sql`SELECT latitude, longitude, updated_at FROM delivery_locations WHERE assignment_id=${a.id} ORDER BY updated_at DESC LIMIT 1`;
  if(!loc.length) return NextResponse.json({location:null, status:a.status, active:true});
  return NextResponse.json({location:loc[0], status:a.status, active:true, partner_id:a.delivery_partner_id});
}
