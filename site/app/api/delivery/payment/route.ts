import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ensureDeliveryTables, verifyDeliverySession, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function genId(){ return `pay-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
export async function GET(req:NextRequest){
  const url=new URL(req.url);
  const order_id=url.searchParams.get('order_id');
  if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
  const sql=getSql(); await ensureDeliveryTables();
  const order:any[] = await sql`SELECT id, total, payment_status, payment_method FROM orders WHERE id=${order_id} LIMIT 1`;
  if(!order.length) return NextResponse.json({error:'Order not found'},{status:404});
  const delivery=await verifyDeliverySession(req);
  const admin=await verifyAdminSession(req);
  const customerId=req.cookies.get('customer_session')?.value?.split('_')[1]||null;
  // Check access
  const assignment:any[] = await sql`SELECT delivery_partner_id FROM delivery_assignments WHERE order_id=${order_id} LIMIT 1`;
  const isOwner = customerId && (await sql`SELECT user_id FROM orders WHERE id=${order_id} LIMIT 1`)[0]?.user_id===customerId;
  if(!admin && !isOwner && !(delivery && assignment.length && assignment[0].delivery_partner_id===delivery.id)) return NextResponse.json({error:'Forbidden'},{status:403});
  const isPaid = order[0].payment_status==='paid';
  return NextResponse.json({payment_status:order[0].payment_status, payment_method:order[0].payment_method, total:order[0].total, isPaid, needsCollection: !isPaid && order[0].payment_status!=='paid'});
}
export async function POST(req:NextRequest){
  const delivery=await verifyDeliverySession(req);
  if(!delivery) return NextResponse.json({error:'Delivery auth'},{status:401});
  const {order_id, method, amount} = await req.json();
  if(!order_id || !method) return NextResponse.json({error:'order_id and method required'},{status:400});
  const sql=getSql(); await ensureDeliveryTables();
  const assignment:any[] = await sql`SELECT id FROM delivery_assignments WHERE order_id=${order_id} AND delivery_partner_id=${delivery.id} LIMIT 1`;
  if(!assignment.length) return NextResponse.json({error:'Not assigned'},{status:403});
  const order:any[] = await sql`SELECT id, total, payment_status FROM orders WHERE id=${order_id} LIMIT 1`;
  if(!order.length) return NextResponse.json({error:'Order not found'},{status:404});
  if(order[0].payment_status==='paid') return NextResponse.json({error:'Already paid'},{status:400});
  const expected=order[0].total;
  if(amount && Number(amount)!==expected) return NextResponse.json({error:`Amount mismatch, expected ${expected}`},{status:400});
  // Prevent duplicate
  const existing:any[] = await sql`SELECT id FROM delivery_payments WHERE order_id=${order_id} LIMIT 1`;
  if(existing.length) return NextResponse.json({error:'Already collected'},{status:400});
  if(!['cash','razorpay_qr','online'].includes(method)) return NextResponse.json({error:'Invalid method'},{status:400});
  const id=genId();
  await sql`INSERT INTO delivery_payments (id, order_id, partner_id, amount, method) VALUES (${id}, ${order_id}, ${delivery.id}, ${expected}, ${method})`;
  await sql`UPDATE orders SET payment_status='paid', updated_at=NOW() WHERE id=${order_id}`;
  return NextResponse.json({success:true, payment_status:'paid'});
}
