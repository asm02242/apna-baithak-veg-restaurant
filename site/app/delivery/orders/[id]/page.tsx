'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DeliveryOrderDetail(){
  const { id } = useParams() as {id:string};
  const router=useRouter();
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [otp,setOtp]=useState('');
  const [msg,setMsg]=useState('');
  const [locWatch,setLocWatch]=useState<number|null>(null);

  const fetchData=async()=>{
    const r=await fetch(`/api/delivery/assignment?order_id=${id}`,{cache:'no-store'});
    const d=await r.json();
    if(d.assignment) setData(d.assignment);
    setLoading(false);
  };
  useEffect(()=>{ fetchData(); const i=setInterval(fetchData,8000); return()=>clearInterval(i); },[id]);

  const action=async(act:string)=>{
    setMsg('');
    const r=await fetch('/api/delivery/assignment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id, action:act})});
    const d=await r.json();
    if(!r.ok) setMsg(d.error||'Failed');
    else { setMsg('Updated: '+ (d.status||act)); fetchData(); }
  };
  const verifyOtp=async()=>{
    const r=await fetch('/api/delivery/otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id, otp, action:'verify'})});
    const d=await r.json();
    if(!r.ok) setMsg(d.error||'OTP failed'); else { setMsg('OTP verified ✓'); fetchData(); }
  };
  const collectPayment=async()=>{
    if(!confirm(`Confirm you received ₹${data?.total}?`)) return;
    const r=await fetch('/api/delivery/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id, method:'cash'})});
    const d=await r.json();
    if(!r.ok) setMsg(d.error); else setMsg('Payment collected ✓');
  };
  const startTracking=()=>{
    if(!navigator.geolocation) { setMsg('Geolocation not supported'); return; }
    if(locWatch) return;
    const wid=navigator.geolocation.watchPosition(async pos=>{
      const {latitude, longitude}=pos.coords;
      await fetch('/api/delivery/location',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:id, latitude, longitude})});
    },e=>setMsg('GPS error: '+e.message),{enableHighAccuracy:true, maximumAge:10000});
    setLocWatch(wid as any);
    setMsg('Live tracking started');
  };
  const stopTracking=()=>{
    if(locWatch) navigator.geolocation.clearWatch(locWatch as any);
    setLocWatch(null);
  };
  useEffect(()=>{ return()=>{ if(locWatch) navigator.geolocation.clearWatch(locWatch as any); }; },[locWatch]);

  if(loading) return <div className="min-h-screen bg-[#fff7ed] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#ea580c] animate-spin"/></div>;
  if(!data) return <div className="min-h-screen bg-[#fff7ed] p-6 text-center">Order not found or not assigned to you</div>;
  const isPaid=data.payment_status==='paid';
  const status=data.status;
  return (
    <div className="min-h-screen bg-[#fff7ed] pb-20">
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="mx-auto max-w-[640px] px-4 py-3 flex items-center gap-3">
          <button onClick={()=>router.back()} className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-bold">← Back</button>
          <div className="font-black">Order #{id.slice(-6)}</div>
          <span className="ml-auto rounded-full bg-[#1c0a00] px-2 py-1 text-xs font-black text-white">{status}</span>
        </div>
      </header>
      <div className="mx-auto max-w-[640px] px-4 py-4 space-y-4">
        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">Customer</div>
          <div className="mt-1 text-sm font-bold">{data.customer_name} • {data.phone}</div>
          <div className="text-xs text-black/60">{data.address}</div>
          <a href={`tel:${data.phone}`} className="mt-3 block rounded-full bg-[#ea580c] py-3 text-center text-sm font-black text-white">📞 CALL CUSTOMER</a>
        </div>

        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">Items • ₹{data.total}</div>
          {(data.items||[]).map((it:any)=><div key={it.id} className="mt-2 flex justify-between text-sm"><span>{it.name} x{it.quantity} {it.variant?`(${it.variant})`:''}</span><span className="font-bold">₹{it.total_price}</span></div>)}
          <div className="mt-3 rounded-xl bg-[#fff7ed] p-3">
            <div className="text-xs font-bold">Payment</div>
            {isPaid ? <div className="mt-1 rounded-full bg-[#16a34a] px-3 py-2 text-sm font-black text-white text-center">✓ PAID ONLINE • ₹{data.total}</div> : <div className="mt-1 rounded-full bg-amber-100 border border-amber-200 px-3 py-2 text-sm font-black text-amber-800 text-center">💵 PAYMENT REQUIRED • ₹{data.total}</div>}
            {!isPaid && status!=='DELIVERED' && <button onClick={collectPayment} className="mt-3 w-full rounded-full bg-[#1c0a00] py-3 text-sm font-black text-white">PAYMENT COLLECTED</button>}
            {!isPaid && <div className="mt-2 text-xs text-black/50">If unpaid, show Razorpay QR or collect cash, then press Payment Collected (server validated).</div>}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">Delivery Flow</div>
          <div className="mt-3 grid gap-2">
            {status==='ASSIGNED' && <button onClick={()=>action('accept')} className="rounded-full bg-[#ea580c] py-4 text-sm font-black text-white">✓ ACCEPT DELIVERY</button>}
            {status==='ACCEPTED' && <button onClick={()=>action('picked')} className="rounded-full bg-[#1c0a00] py-4 text-sm font-black text-white">📦 PICKED UP</button>}
            {status==='PICKED_UP' && <button onClick={()=>{action('ontheway'); startTracking();}} className="rounded-full bg-[#16a34a] py-4 text-sm font-black text-white">🛵 START DELIVERY</button>}
            {status==='ON_THE_WAY' && <div className="space-y-2"><button onClick={()=>action('arrived')} className="w-full rounded-full bg-[#1c0a00] py-4 text-sm font-black text-white">📍 ARRIVED</button><button onClick={startTracking} className="w-full rounded-full border bg-white py-3 text-sm font-bold">Start Live Tracking</button></div>}
            {status==='ARRIVED' && (
              <div className="space-y-2">
                <div className="rounded-xl bg-[#fff7ed] p-3">
                  <div className="text-xs font-bold">Enter Delivery OTP (customer provides)</div>
                  <div className="mt-2 flex gap-2"><input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} className="flex-1 rounded-xl border px-4 py-3 text-sm tracking-widest font-black" /><button onClick={verifyOtp} className="rounded-xl bg-[#ea580c] px-4 py-3 text-sm font-black text-white">Verify</button></div>
                </div>
                <button onClick={()=>action('delivered')} className="w-full rounded-full bg-[#16a34a] py-4 text-sm font-black text-white">✓ DELIVERED</button>
              </div>
            )}
            {status==='DELIVERED' && <div className="rounded-xl bg-[#16a34a] py-4 text-center text-sm font-black text-white">✓ DELIVERED — Live tracking stopped</div>}
            <div className="flex gap-2"><button onClick={startTracking} className="flex-1 rounded-full border bg-white py-2.5 text-xs font-bold">Start GPS</button><button onClick={stopTracking} className="flex-1 rounded-full border bg-white py-2.5 text-xs font-bold">Stop GPS</button></div>
          </div>
          {msg && <div className="mt-3 rounded-xl bg-black py-2 text-center text-xs font-bold text-white">{msg}</div>}
        </div>

        <div className="text-xs text-black/40 text-center">Status machine: ASSIGNED → ACCEPTED → PICKED_UP → ON_THE_WAY → ARRIVED → DELIVERED • Payment separate</div>
      </div>
    </div>
  );
}
