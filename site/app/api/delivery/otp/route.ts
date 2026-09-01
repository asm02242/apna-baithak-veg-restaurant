import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { ensureDeliveryTables, verifyDeliverySession, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function hash(s:string){ return crypto.createHash('sha256').update(s).digest('hex'); }
function genId(p='otp'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
export async function POST(req:NextRequest){
  const sql=getSql(); await ensureDeliveryTables();
  const body=await req.json();
  const {order_id, otp, action} = body;
  if(action==='generate'){
    const admin=await verifyAdminSession(req);
    if(!admin) return NextResponse.json({error:'Admin only'},{status:401});
    if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
    const assignment:any[] = await sql`SELECT id FROM delivery_assignments WHERE order_id=${order_id} LIMIT 1`;
    if(!assignment.length) return NextResponse.json({error:'Not assigned'},{status:404});
    const code=Math.floor(100000+Math.random()*900000).toString();
    const h=hash(code);
    const id=genId('otp');
    await sql`INSERT INTO delivery_otps (id, order_id, assignment_id, otp_hash, expires_at, attempts, verified) VALUES (${id}, ${order_id}, ${assignment[0].id}, ${h}, NOW()+INTERVAL '30 minutes', 0, false)`;
    console.log(`OTP for ${order_id}: ${code}`);
    return NextResponse.json({success:true, otp: code});
  }
  if(action==='verify'){
    const delivery=await verifyDeliverySession(req);
    if(!delivery) return NextResponse.json({error:'Delivery auth'},{status:401});
    if(!order_id || !otp) return NextResponse.json({error:'order_id and otp required'},{status:400});
    const rows:any[] = await sql`SELECT da.id as assignment_id, da.delivery_partner_id FROM delivery_assignments da WHERE da.order_id=${order_id} LIMIT 1`;
    if(!rows.length || rows[0].delivery_partner_id!==delivery.id) return NextResponse.json({error:'Not assigned'},{status:403});
    const otpRows:any[] = await sql`SELECT id, otp_hash, expires_at, attempts, verified FROM delivery_otps WHERE order_id=${order_id} ORDER BY created_at DESC LIMIT 1`;
    if(!otpRows.length) return NextResponse.json({error:'No OTP generated'},{status:404});
    const o=otpRows[0];
    if(o.verified) return NextResponse.json({success:true, already:true});
    if(new Date(o.expires_at) < new Date()) return NextResponse.json({error:'OTP expired'},{status:400});
    if(o.attempts>=3) return NextResponse.json({error:'Too many attempts'},{status:400});
    await sql`UPDATE delivery_otps SET attempts=attempts+1 WHERE id=${o.id}`;
    if(hash(otp)===o.otp_hash){
      await sql`UPDATE delivery_otps SET verified=true WHERE id=${o.id}`;
      return NextResponse.json({success:true, verified:true});
    } else {
      return NextResponse.json({error:'Invalid OTP'},{status:400});
    }
  }
  return NextResponse.json({error:'Invalid action'},{status:400});
}
export async function GET(req:NextRequest){
  const url=new URL(req.url);
  const order_id=url.searchParams.get('order_id');
  if(!order_id) return NextResponse.json({error:'order_id required'},{status:400});
  const sql=getSql(); await ensureDeliveryTables();
  const rows:any[] = await sql`SELECT verified, expires_at, attempts FROM delivery_otps WHERE order_id=${order_id} ORDER BY created_at DESC LIMIT 1`;
  if(!rows.length) return NextResponse.json({otp:null});
  return NextResponse.json({otp:{verified:rows[0].verified, expires_at:rows[0].expires_at, attempts:rows[0].attempts}});
}
