'use client';
import { useEffect, useState } from 'react';

export default function AdminDeliveryPartners(){
  const [partners,setPartners]=useState<any[]>([]);
  const [form,setForm]=useState({name:'',phone:'',email:'',password:''});
  const [loading,setLoading]=useState(true);
  const fetchAll=async()=>{
    const r=await fetch('/api/admin/delivery-partners',{cache:'no-store'});
    const d=await r.json();
    if(d.partners) setPartners(d.partners);
    setLoading(false);
  };
  useEffect(()=>{ fetchAll(); },[]);
  const create=async()=>{
    if(!form.name||!form.phone||!form.password) return alert('Name, phone, password required');
    const r=await fetch('/api/admin/delivery-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create', ...form})});
    const d=await r.json();
    if(!r.ok) alert(d.error); else { setForm({name:'',phone:'',email:'',password:''}); fetchAll(); }
  };
  const toggleActive=async(id:string)=>{ await fetch('/api/admin/delivery-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggleActive', id})}); fetchAll(); };
  const toggleOnline=async(id:string)=>{ await fetch('/api/admin/delivery-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'toggleOnline', id})}); fetchAll(); };
  const remove=async(id:string)=>{ if(!confirm('Delete partner?')) return; await fetch('/api/admin/delivery-partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete', id})}); fetchAll(); };

  if(loading) return <div className="min-h-[60vh] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#ea580c] animate-spin"/></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="font-display text-2xl font-black">Delivery Partners</h1><span className="text-sm text-black/50">{partners.length} partners</span></div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
        <div className="text-sm font-black">Add Partner</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" className="rounded-xl border px-3 py-2.5 text-sm" />
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone 10-digit" className="rounded-xl border px-3 py-2.5 text-sm" />
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email (optional)" className="rounded-xl border px-3 py-2.5 text-sm" />
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" type="password" className="rounded-xl border px-3 py-2.5 text-sm" />
        </div>
        <button onClick={create} className="mt-3 rounded-xl bg-[#1c0a00] px-5 py-2.5 text-sm font-black text-white">+ Create Partner</button>
      </div>
      <div className="grid gap-3">
        {partners.map(p=>(
          <div key={p.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div>
              <div className="font-black">{p.name} <span className="text-xs font-mono text-black/40">{p.id.slice(-6)}</span></div>
              <div className="text-sm text-black/60">{p.phone} {p.email?`• ${p.email}`:''}</div>
              <div className="mt-1 flex gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-bold ${p.is_active?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{p.is_active?'Active':'Inactive'}</span><span className={`rounded-full px-2 py-1 font-bold ${p.is_online?'bg-blue-100 text-blue-700':'bg-gray-100 text-black/50'}`}>{p.is_online?'● Online':'○ Offline'}</span><span className="rounded-full bg-black text-white px-2 py-1 font-bold">{p.active||0} active • {p.completed||0} done</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>toggleActive(p.id)} className="rounded-full bg-white border px-3 py-1.5 text-xs font-bold">{p.is_active?'Deactivate':'Activate'}</button>
              <button onClick={()=>toggleOnline(p.id)} className="rounded-full bg-white border px-3 py-1.5 text-xs font-bold">{p.is_online?'Set Offline':'Set Online'}</button>
              <button onClick={()=>remove(p.id)} className="rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">Delete</button>
              <a href={`/admin/orders`} className="rounded-full bg-[#ea580c] px-3 py-1.5 text-xs font-black text-white">Assign Orders</a>
            </div>
          </div>
        ))}
        {partners.length===0 && <div className="rounded-2xl bg-white p-8 text-center text-sm text-black/50">No partners yet. Create one above.</div>}
      </div>
    </div>
  );
}
