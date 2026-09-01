'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeliveryLogin(){
  const router=useRouter();
  const [phone,setPhone]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setErr(''); setLoading(true);
    try{
      const r=await fetch('/api/delivery/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',phone,password})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Login failed');
      router.push('/delivery');
      router.refresh();
    }catch(e:any){ setErr(e.message); } finally{ setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-[#fff7ed] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] rounded-[24px] bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1c0a00] text-white font-black text-xl">🛵</div>
          <h1 className="mt-4 font-display text-2xl font-black text-[#1c0a00]">Delivery Partner</h1>
          <p className="mt-1 text-sm text-black/60">Apna Baithak • Eldeco City</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {err && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-600">{err}</div>}
          <div><label className="text-xs font-bold">Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit phone" inputMode="numeric" className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" /></div>
          <div><label className="text-xs font-bold">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" /></div>
          <button disabled={loading} className="w-full rounded-full bg-[#1c0a00] py-3 text-sm font-black text-white hover:bg-black disabled:opacity-60">{loading?'Signing in…':'Sign In'}</button>
        </form>
        <div className="mt-6 text-center text-xs text-black/40">Delivery partner access only • Contact admin for account</div>
        <Link href="/" className="mt-4 block text-center text-xs font-bold text-[#ea580c] hover:underline">← Back to website</Link>
      </div>
    </div>
  );
}
