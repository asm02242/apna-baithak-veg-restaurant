import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ensureDeliveryTables, verifyDeliverySession, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
export async function GET(req:NextRequest){
  const sql=getSql(); await ensureDeliveryTables();
  const url=new URL(req.url);
  const status=url.searchParams.get('status'); // new|active|completed|cancelled|all
  const delivery=await verifyDeliverySession(req);
  const admin=await verifyAdminSession(req);
  if(!delivery && !admin) return NextResponse.json({error:'Unauthorized'},{status:401});
  let assignments:any[]=[];
  if(delivery){
    // Delivery sees only assigned to them
    if(status==='new') assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status, o.order_status FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.delivery_partner_id=${delivery.id} AND da.status='ASSIGNED' ORDER BY da.assigned_at DESC`;
    else if(status==='active') assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status, o.order_status FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.delivery_partner_id=${delivery.id} AND da.status IN ('ACCEPTED','PICKED_UP','ON_THE_WAY','ARRIVED') ORDER BY da.updated_at DESC`;
    else if(status==='completed') assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.delivery_partner_id=${delivery.id} AND da.status='DELIVERED' ORDER BY da.updated_at DESC LIMIT 50`;
    else if(status==='cancelled') assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.delivery_partner_id=${delivery.id} AND da.status='CANCELLED' ORDER BY da.updated_at DESC`;
    else assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status FROM delivery_assignments da JOIN orders o ON o.id=da.order_id WHERE da.delivery_partner_id=${delivery.id} ORDER BY da.updated_at DESC LIMIT 50`;
    // Enrich with items
    for(const a of assignments){
      a.items = await sql`SELECT * FROM order_items WHERE order_id=${a.order_id}`;
    }
  } else if(admin){
    // Admin sees all
    if(status==='unassigned'){
      assignments = await sql`SELECT o.* FROM orders o WHERE o.id NOT IN (SELECT order_id FROM delivery_assignments) AND o.order_status IN ('CONFIRMED','PREPARING','READY') ORDER BY o.created_at DESC LIMIT 20`;
    } else {
      assignments = await sql`SELECT da.*, o.customer_name, o.phone, o.address, o.total, o.payment_status, dp.name as partner_name FROM delivery_assignments da JOIN orders o ON o.id=da.order_id LEFT JOIN delivery_partners dp ON dp.id=da.delivery_partner_id ORDER BY da.updated_at DESC LIMIT 50`;
      for(const a of assignments){ a.items = await sql`SELECT * FROM order_items WHERE order_id=${a.order_id}`; }
    }
  }
  return NextResponse.json({assignments});
}
