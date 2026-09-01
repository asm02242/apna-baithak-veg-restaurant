'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Assignment = { id:string; order_id:string; status:string; customer_name:string; phone:string; address:string; total:number; payment_status:string; items?:any[] };

export default function DeliveryDashboard(){
  const router=useRouter();
  const [partner,setPartner]=useState<any>(null);
  const [online,setOnline]=useState(false);
  const [stats,setStats]=useState({new:0, active:0, completed:0, today:0, earnings:0});
  const [lists,setLists]=useState<{new:Assignment[],active:Assignment[],completed:Assignment[]}>({new:[],active:[],completed:[]});
  const [loading,setLoading]=useState(true);

  const fetchAll=async()=>{
    const me=await fetch('/api/delivery/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'me'})}).then(r=>r.json()).catch(()=>null);
    if(!me?.partner){ router.push('/delivery/login'); return; }
    setPartner(me.partner); setOnline(!!me.partner.is_online);
    const [n,a,c]=await Promise.all([
      fetch('/api/delivery/orders?status=new',{cache:'no-store'}).then(r=>r.json()).catch(()=>({assignments:[]})),
      fetch('/api/delivery/orders?status=active',{cache:'no-store'}).then(r=>r.json()).catch(()=>({assignments:[]})),
      fetch('/api/delivery/orders?status=completed',{cache:'no-store'}).then(r=>r.json()).catch(()=>({assignments:[]})),
    ]);
    setLists({new:n.assignments||[],active:a.assignments||[],completed:c.assignments||[]});
    setStats({new:(n.assignments||[]).length, active:(a.assignments||[]).length, completed:(c.assignments||[]).length, today:(c.assignments||[]).filter((x:any)=> new Date(x.updated_at).toDateString()===new Date().toDateString()).length, earnings: (c.assignments||[]).reduce((s:any,x:any)=>s+(x.total||0),0)});
    setLoading(false);
  };
  useEffect(()=>{ fetchAll(); const id=setInterval(fetchAll,10000); return()=>clearInterval(id); },[]);

  const toggleOnline=async()=>{
    if(!partner) return;
    const r=await fetch('/api/admin/delivery-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggleOnline', id:partner.id})});
    if(r.ok){ setOnline(!online); fetchAll(); }
  };
  const logout=async()=>{ await fetch('/api/delivery/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})}); router.push('/delivery/login'); };

  if(loading) return <div className="min-h-screen bg-[#fff7ed] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#ea580c] animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#fff7ed] pb-20">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="mx-auto max-w-[640px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1c0a00] text-white font-black">🛵</div>
            <div><div className="font-black leading-none">Delivery Partner</div><div className="text-xs text-black/50">Hi, {partner?.name}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleOnline} className={`rounded-full px-3 py-1.5 text-xs font-black ${online?'bg-[#16a34a] text-white':'bg-black/10 text-black/60'}`}>{online?'● Online':'○ Offline'}</button>
            <button onClick={logout} className="rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[640px] px-4 py-4 space-y-4">
        <div className="rounded-[20px] bg-gradient-to-br from-[#1c0a00] to-[#7c2d12] p-5 text-white">
          <div className="text-xs font-bold opacity-70">Good Morning, {partner?.name?.split(' ')[0]}</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15"><div className="text-xs font-bold opacity-70">NEW</div><div className="text-xl font-black">{stats.new} Delivery</div></div>
            <div className="rounded-2xl bg-white p-3 text-[#1c0a00]"><div className="text-xs font-bold opacity-60">ACTIVE</div><div className="text-xl font-black">{stats.active} Delivery</div></div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15"><div className="text-xs font-bold opacity-70">COMPLETED</div><div className="text-xl font-black">{stats.completed} Deliveries</div></div>
            <div className="rounded-2xl bg-[#ea580c] p-3"><div className="text-xs font-bold opacity-80">TODAY</div><div className="text-xl font-black">₹{stats.earnings}</div></div>
          </div>
        </div>

        {lists.new.length>0 && (
          <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
            <div className="text-sm font-black">🆕 New Assigned</div>
            {lists.new.map(a=>(
              <Link key={a.id} href={`/delivery/orders/${a.order_id}`} className="mt-3 block rounded-2xl border-2 border-[#ea580c]/20 bg-[#fff7ed] p-4">
                <div className="flex justify-between"><span className="font-black">Order #{a.order_id.slice(-6)}</span><span className="rounded-full bg-[#ea580c] px-2 py-1 text-xs font-black text-white">NEW</span></div>
                <div className="mt-1 text-sm font-bold">{a.customer_name} • {a.phone}</div>
                <div className="text-xs text-black/60 line-clamp-2">{a.address}</div>
                <div className="mt-2 text-sm font-black">₹{a.total} • {a.payment_status==='paid'?'✓ PAID ONLINE':'💵 PAYMENT REQUIRED'}</div>
                <div className="mt-2 rounded-full bg-[#1c0a00] py-2 text-center text-xs font-black text-white">View →</div>
              </Link>
            ))}
          </div>
        )}

        {lists.active.length>0 && (
          <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
            <div className="text-sm font-black">🟢 Active Delivery</div>
            {lists.active.map(a=>(
              <Link key={a.id} href={`/delivery/orders/${a.order_id}`} className="mt-3 block rounded-2xl border-2 border-[#16a34a]/30 bg-[#f0fdf4] p-4">
                <div className="flex justify-between"><span className="font-black">Order #{a.order_id.slice(-6)}</span><span className="rounded-full bg-[#16a34a] px-2 py-1 text-xs font-black text-white">{a.status}</span></div>
                <div className="text-sm font-bold">{a.customer_name} • {a.phone}</div>
                <div className="text-xs text-black/60">{a.address}</div>
                <div className="mt-2 rounded-full bg-[#16a34a] py-2 text-center text-xs font-black text-white">Continue →</div>
              </Link>
            ))}
          </div>
        )}

        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">History — Completed Today</div>
          {lists.completed.length===0? <div className="mt-3 text-sm text-black/50">No completed deliveries yet.</div> : lists.completed.slice(0,5).map(a=>(
            <div key={a.id} className="mt-3 flex justify-between rounded-xl bg-[#f7f7f7] p-3">
              <div><div className="text-sm font-bold">#{a.order_id.slice(-6)} • {a.customer_name}</div><div className="text-xs text-black/50">{new Date(a.updated_at).toLocaleString()}</div></div>
              <div className="text-sm font-black">₹{a.total}</div>
            </div>
          ))}
          <Link href="/delivery/orders" className="mt-3 block text-center text-xs font-bold text-[#ea580c]">View all →</Link>
        </div>
      </div>
    </div>
  );
}
