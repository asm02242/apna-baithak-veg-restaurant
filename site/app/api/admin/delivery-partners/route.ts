import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { ensureDeliveryTables, verifyAdminSession } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function hash(p:string){ return crypto.createHash('sha256').update(p).digest('hex'); }
function genId(p='dlv'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
export async function GET(req:NextRequest){
  const admin=await verifyAdminSession(req);
  if(!admin) return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=getSql(); await ensureDeliveryTables();
  const partners:any[] = await sql`SELECT id, name, phone, email, is_active, is_online, created_at FROM delivery_partners ORDER BY created_at DESC`;
  // Enrich with stats
  const result=[];
  for(const p of partners){
    const active:any[] = await sql`SELECT COUNT(*)::int as cnt FROM delivery_assignments WHERE delivery_partner_id=${p.id} AND status IN ('ASSIGNED','ACCEPTED','PICKED_UP','ON_THE_WAY','ARRIVED')`;
    const completed:any[] = await sql`SELECT COUNT(*)::int as cnt FROM delivery_assignments WHERE delivery_partner_id=${p.id} AND status='DELIVERED'`;
    const cancelled:any[] = await sql`SELECT COUNT(*)::int as cnt FROM delivery_assignments WHERE delivery_partner_id=${p.id} AND status='CANCELLED'`;
    const today:any[] = await sql`SELECT COUNT(*)::int as cnt FROM delivery_assignments WHERE delivery_partner_id=${p.id} AND status='DELIVERED' AND updated_at >= CURRENT_DATE`;
    result.push({...p, active: active[0].cnt, completed: completed[0].cnt, cancelled: cancelled[0].cnt, today: today[0].cnt});
  }
  return NextResponse.json({partners:result});
}
export async function POST(req:NextRequest){
  const admin=await verifyAdminSession(req);
  if(!admin) return NextResponse.json({error:'Unauthorized'},{status:401});
  const sql=getSql(); await ensureDeliveryTables();
  const body=await req.json();
  const {action, id, name, phone, email, password, is_active, is_online} = body;
  if(action==='create'){
    if(!name||!phone||!password) return NextResponse.json({error:'name, phone, password required'},{status:400});
    const phoneDigits=phone.replace(/\D/g,'');
    const exists:any[] = await sql`SELECT id FROM delivery_partners WHERE phone=${phoneDigits} LIMIT 1`;
    if(exists.length) return NextResponse.json({error:'Phone already exists'},{status:409});
    const newId=genId('dlv');
    const pwdHash=hash(password);
    await sql`INSERT INTO delivery_partners (id, name, phone, email, password_hash, is_active, is_online) VALUES (${newId}, ${name}, ${phoneDigits}, ${email||null}, ${pwdHash}, ${is_active!==false}, ${false})`;
    const row:any[] = await sql`SELECT id, name, phone, email, is_active, is_online, created_at FROM delivery_partners WHERE id=${newId} LIMIT 1`;
    return NextResponse.json({success:true, partner:row[0]});
  }
  if(action==='update'){
    if(!id) return NextResponse.json({error:'id required'},{status:400});
    const updates:any[] = [];
    if(name) await sql`UPDATE delivery_partners SET name=${name}, updated_at=NOW() WHERE id=${id}`;
    if(phone) { const pd=phone.replace(/\D/g,''); await sql`UPDATE delivery_partners SET phone=${pd}, updated_at=NOW() WHERE id=${id}`; }
    if(email!==undefined) await sql`UPDATE delivery_partners SET email=${email||null}, updated_at=NOW() WHERE id=${id}`;
    if(password) { const h=hash(password); await sql`UPDATE delivery_partners SET password_hash=${h}, updated_at=NOW() WHERE id=${id}`; }
    if(is_active!==undefined) await sql`UPDATE delivery_partners SET is_active=${Boolean(is_active)}, updated_at=NOW() WHERE id=${id}`;
    if(is_online!==undefined) await sql`UPDATE delivery_partners SET is_online=${Boolean(is_online)}, updated_at=NOW() WHERE id=${id}`;
    return NextResponse.json({success:true});
  }
  if(action==='toggleActive'){
    if(!id) return NextResponse.json({error:'id required'},{status:400});
    const rows:any[] = await sql`SELECT is_active FROM delivery_partners WHERE id=${id} LIMIT 1`;
    if(!rows.length) return NextResponse.json({error:'Not found'},{status:404});
    await sql`UPDATE delivery_partners SET is_active=${!rows[0].is_active}, updated_at=NOW() WHERE id=${id}`;
    return NextResponse.json({success:true});
  }
  if(action==='toggleOnline'){
    if(!id) return NextResponse.json({error:'id required'},{status:400});
    const rows:any[] = await sql`SELECT is_online FROM delivery_partners WHERE id=${id} LIMIT 1`;
    if(!rows.length) return NextResponse.json({error:'Not found'},{status:404});
    await sql`UPDATE delivery_partners SET is_online=${!rows[0].is_online}, updated_at=NOW() WHERE id=${id}`;
    return NextResponse.json({success:true});
  }
  if(action==='delete'){
    if(!id) return NextResponse.json({error:'id required'},{status:400});
    await sql`DELETE FROM delivery_partners WHERE id=${id}`;
    return NextResponse.json({success:true});
  }
  return NextResponse.json({error:'Invalid action'},{status:400});
}
