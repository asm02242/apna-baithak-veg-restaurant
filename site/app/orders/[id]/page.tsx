'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function OrderTrack(){
  const { id } = useParams() as {id:string};
  const [order,setOrder]=useState<any>(null);
  const [assignment,setAssignment]=useState<any>(null);
  const [location,setLocation]=useState<any>(null);
  const [loading,setLoading]=useState(true);

  const fetchAll=async()=>{
    try{
      const r=await fetch(`/api/orders`,{cache:'no-store'});
      const d=await r.json();
      const found=(d.orders||[]).find((o:any)=>o.id===id);
      if(found) setOrder(found);
      const a=await fetch(`/api/delivery/assignment?order_id=${id}`,{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
      if(a?.assignment) setAssignment(a.assignment);
      const l=await fetch(`/api/delivery/location?order_id=${id}`,{cache:'no-store'}).then(r=>r.json()).catch(()=>null);
      if(l?.location) setLocation(l.location);
    }catch{} finally{ setLoading(false); }
  };
  useEffect(()=>{ fetchAll(); const iv=setInterval(fetchAll,10000); return()=>clearInterval(iv); },[id]);

  if(loading) return <div className="min-h-screen bg-[#fff7ed] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#ea580c] animate-spin"/></div>;
  if(!order) return <div className="min-h-screen bg-[#fff7ed] p-8 text-center"><div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">Order not found</div><Link href="/orders" className="mt-4 inline-block rounded-full bg-black px-4 py-2 text-sm font-bold text-white">Back to orders</Link></div>;

  const steps=['PENDING','CONFIRMED','PREPARING','READY','PICKED_UP','ON_THE_WAY','ARRIVED','DELIVERED'];
  const currentIdx=steps.indexOf(order.order_status||'PENDING');
  const isActive=['PICKED_UP','ON_THE_WAY','ARRIVED'].includes(assignment?.status);
  const isDelivered=assignment?.status==='DELIVERED' || order.order_status==='DELIVERED';

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="mx-auto max-w-[640px] px-4 py-3 flex items-center gap-3">
          <Link href="/orders" className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-bold">← Orders</Link>
          <div className="font-black">Order #{id.slice(-6)}</div>
          <span className={`ml-auto rounded-full px-2 py-1 text-xs font-black ${isDelivered?'bg-[#16a34a] text-white':'bg-[#ea580c] text-white'}`}>{assignment?.status||order.order_status}</span>
        </div>
      </header>
      <div className="mx-auto max-w-[640px] px-4 py-4 space-y-4">
        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">Track Order</div>
          <div className="mt-3 space-y-2">
            {['Order Confirmed','Preparing','Ready','Picked Up','On The Way','Arrived','Delivered'].map((label,idx)=>{
              const stepIdx=idx+1; // PENDING=0, CONFIRMED=1 etc
              const done= currentIdx>=stepIdx || isDelivered;
              const active= currentIdx===stepIdx;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${done?'bg-[#16a34a] text-white':'bg-black/10 text-black/40'}`}>{done?'✓':'○'}</span>
                  <span className={`text-sm ${done?'font-bold text-[#1c0a00]': active?'font-black text-[#ea580c]':'text-black/40'}`}>{label}</span>
                  {active && <span className="ml-auto h-2 w-2 rounded-full bg-[#ea580c] animate-pulse"/>}
                </div>
              );
            })}
          </div>
        </div>

        {isActive && location && (
          <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
            <div className="text-sm font-black">🛵 Live Location</div>
            <div className="mt-2 rounded-xl overflow-hidden ring-1 ring-black/5">
              <iframe
                src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                className="h-[280px] w-full border-0"
                loading="lazy"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-bold">Partner {assignment?.partner_name||''}</span>
              <span className="text-black/50">Updated {new Date(location.updated_at).toLocaleTimeString()} • {Math.floor((Date.now()-new Date(location.updated_at).getTime())/1000)}s ago</span>
            </div>
            <div className="mt-1 text-xs text-black/60">Destination: {order.address}</div>
            <a href={`tel:${assignment?.partner_phone||''}`} className="mt-3 block rounded-full bg-[#ea580c] py-3 text-center text-sm font-black text-white">📞 CALL PARTNER</a>
          </div>
        )}

        {isActive && !location && (
          <div className="rounded-[20px] bg-amber-50 border border-amber-200 p-4 text-sm">
            <div className="font-black text-amber-800">Location temporarily unavailable</div>
            <div className="text-xs text-amber-700">Partner location will appear shortly. Last updated: {assignment?.updated_at? new Date(assignment.updated_at).toLocaleTimeString(): '—'}</div>
          </div>
        )}

        {isDelivered && (
          <div className="rounded-[20px] bg-[#16a34a] p-6 text-center text-white">
            <div className="text-3xl">🎉</div>
            <div className="mt-2 font-black">✓ DELIVERED</div>
            <div className="text-sm opacity-80">Live tracking ended • Thank you!</div>
          </div>
        )}

        <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5">
          <div className="text-sm font-black">Order #{id.slice(-6)} • ₹{order.total} • {order.payment_status==='paid'?'✓ PAID ONLINE':'💵 PAYMENT REQUIRED'}</div>
          <div className="mt-2 text-xs text-black/60">{order.address}</div>
          <div className="mt-2 text-xs">Customer: {order.customer_name} • {order.phone}</div>
        </div>

        <Link href="/" className="block rounded-full bg-black py-3 text-center text-sm font-black text-white">← Back to Home</Link>
      </div>
    </div>
  );
}
