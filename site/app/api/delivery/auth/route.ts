import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { ensureDeliveryTables } from '@/lib/delivery';
function getSql(){ return neon(process.env.DATABASE_URL||process.env.POSTGRES_URL!); }
function hash(p:string){ return crypto.createHash('sha256').update(p).digest('hex'); }
function genId(p='dlv'){ return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
const fails = globalThis as unknown as { __DLV_FAILS__?: Map<string,{count:number,until:number}> };
if(!fails.__DLV_FAILS__) fails.__DLV_FAILS__=new Map();
const failMap=fails.__DLV_FAILS__!;
function getIp(req:NextRequest){ return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'; }
export async function POST(req:NextRequest){
  try{
    const {action, phone, password, name, email} = await req.json();
    const sql=getSql(); await ensureDeliveryTables();
    if(action==='login'){
      const ip=getIp(req); const rec=failMap.get(ip);
      if(rec && rec.until>Date.now()) return NextResponse.json({error:`Too many attempts, try ${Math.ceil((rec.until-Date.now())/1000)}s`},{status:429});
      if(!phone||!password) return NextResponse.json({error:'phone and password required'},{status:400});
      const phoneDigits=phone.replace(/\D/g,'');
      const rows:any[] = await sql`SELECT id, name, phone, email, password_hash, is_active FROM delivery_partners WHERE phone=${phoneDigits} LIMIT 1`;
      if(!rows.length || rows[0].password_hash!==hash(password) || !rows[0].is_active){
        const cur=failMap.get(ip)||{count:0,until:0}; cur.count++; if(cur.count>=5) cur.until=Date.now()+15*60*1000; failMap.set(ip,cur);
        return NextResponse.json({error:'Invalid credentials or inactive'},{status:401});
      }
      failMap.delete(ip);
      const partner=rows[0];
      const token=`delivery_${partner.id}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const res=NextResponse.json({success:true, partner:{id:partner.id,name:partner.name,phone:partner.phone,email:partner.email}});
      res.cookies.set('delivery_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:60*60*24*30,path:'/'});
      return res;
    }
    if(action==='me'){
      const tok=req.cookies.get('delivery_session')?.value;
      if(!tok) return NextResponse.json({partner:null});
      const id=tok.split('_')[1];
      const rows:any[] = await sql`SELECT id, name, phone, email, is_active, is_online FROM delivery_partners WHERE id=${id} LIMIT 1`;
      if(!rows.length) return NextResponse.json({partner:null});
      return NextResponse.json({partner:rows[0]});
    }
    if(action==='logout'){
      const res=NextResponse.json({success:true});
      res.cookies.delete('delivery_session');
      return res;
    }
    if(action==='register'){
      // Only for seeding via admin - but allow for now with admin check?
      // This is not exposed to public; admin should use /api/admin/delivery-partners
      return NextResponse.json({error:'Use admin panel'},{status:403});
    }
    return NextResponse.json({error:'Invalid action'},{status:400});
  }catch(e:any){ return NextResponse.json({error:e.message||'Server error'},{status:500}); }
}
