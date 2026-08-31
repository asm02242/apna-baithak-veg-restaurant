"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";

type Order = { id: string; customer_name?: string; phone?: string; address?: string; subtotal: number; discount?: number; delivery_fee?: number; total: number; coupon_code?: string; offer_id?: string; payment_method: string; payment_status?: string; order_status: string; notes?: string; created_at: string; items: any[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/orders", { cache: "no-store" });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not load orders");
        if (!cancelled) setOrders(d.orders || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load orders — login required for Neon orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: string) => {
    if (s === "DELIVERED") return "bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/20";
    if (s === "CANCELLED") return "bg-[#fef2f2] text-[#e11d48] border-red-200";
    if (s === "PENDING") return "bg-[#fffbeb] text-[#92400e] border-[#f59e0b]/20";
    if (s === "CONFIRMED" || s === "PREPARING") return "bg-[#eff6ff] text-[#2563eb] border-blue-200";
    return "bg-white border-black/10 text-black/70";
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff7ed]">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#1c0a00]">My Orders</h1>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black ring-1 ring-black/5">{orders.length} orders</span>
            <Link href="/account" className="ml-auto hidden sm:inline-flex rounded-full border bg-white px-4 py-2 text-xs font-black">Account →</Link>
          </div>
          <p className="mt-1 text-sm text-black/60">Real Neon data via <span className="font-mono text-xs bg-white border border-black/5 px-1.5 py-0.5 rounded">GET /api/orders</span> • filtered by your user. Login via /login to see your orders. Data includes items, totals, status.</p>

          {loading ? (
            <div className="mt-6 grid gap-3">{[1,2,3].map((i) => <div key={i} className="h-28 rounded-[24px] bg-white shimmer ring-1 ring-black/5" />)}</div>
          ) : error ? (
            <div className="mt-6 rounded-[24px] bg-white p-8 text-center ring-1 ring-black/5">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff7ed] text-2xl">🔒</div>
              <div className="mt-3 text-base font-black">Login required</div>
              <div className="mt-1 text-sm text-black/60">{error}</div>
              <div className="mt-1 text-xs text-black/40">Orders are stored in Neon. Ensure you login via the customer auth ( /api/customer/auth ) — cookie <span className="font-mono">customer_session</span> is required.</div>
              <div className="mt-5 flex justify-center gap-2">
                <Link href="/login" className="rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">Login</Link>
                <Link href="/signup" className="rounded-full border bg-white px-6 py-3 text-sm font-black">Create account</Link>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 rounded-[28px] bg-white p-10 text-center ring-1 ring-black/5">
              <div className="text-3xl">🧾</div>
              <div className="mt-3 text-lg font-black">No orders yet</div>
              <p className="mt-1 text-sm text-black/60">Your Neon orders will appear here once you checkout. Try placing an order — we POST to /api/orders securely.</p>
              <Link href="/menu" className="mt-5 inline-flex rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">Browse Menu →</Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-[24px] bg-white ring-1 ring-black/5 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black bg-[#fff7ed] border border-black/5 px-2 py-1 rounded-full">#{o.id}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black border ${statusColor(o.order_status)}`}>{o.order_status}</span>
                        <span className="rounded-full bg-white border border-black/5 px-2 py-1 text-xs font-bold">{o.payment_method.toUpperCase()} • {o.payment_status || "pending"}</span>
                      </div>
                      <div className="mt-2 text-sm text-black/60 flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-[#1c0a00]">{new Date(o.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>₹{o.total} total</span>
                        {o.coupon_code && <span className="rounded-full bg-[#fffbeb] border border-[#f59e0b]/20 px-2 py-0.5 text-xs font-bold">Coupon {o.coupon_code}</span>}
                        {o.offer_id && <span className="rounded-full bg-[#f0fdf4] border border-[#16a34a]/20 px-2 py-0.5 text-xs font-bold">Offer {o.offer_id}</span>}
                      </div>
                      <div className="mt-1 text-xs text-black/50 line-clamp-1">{o.address || ""} {o.notes ? `• ${o.notes}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-2xl bg-[#fff7ed] border border-black/5 px-4 py-2 text-sm font-black">₹{o.total}</span>
                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="rounded-full bg-[#1c0a00] px-4 py-2 text-xs font-black text-white">{expanded === o.id ? "Hide" : "Details"}</button>
                    </div>
                  </div>
                  {expanded === o.id && (
                    <div className="border-t border-black/5 bg-[#fff7ed]/40 p-4 sm:p-5">
                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div className="rounded-2xl bg-white p-3 border border-black/5">
                          <div className="text-xs font-bold text-black/50">Customer</div>
                          <div className="font-bold">{o.customer_name}</div>
                          <div className="text-xs text-black/60">{o.phone}</div>
                          <div className="mt-1 text-xs text-black/60 leading-snug">{o.address}</div>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-black/5">
                          <div className="text-xs font-bold text-black/50">Bill</div>
                          <div className="mt-1 space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-black/60">Subtotal</span><span className="font-bold">₹{o.subtotal}</span></div>
                            <div className="flex justify-between"><span className="text-black/60">Discount</span><span className="font-bold">-₹{o.discount || 0}</span></div>
                            <div className="flex justify-between"><span className="text-black/60">Delivery</span><span className="font-bold">₹{o.delivery_fee || 0}</span></div>
                            <div className="flex justify-between border-t border-black/5 pt-1 font-black"><span>Total</span><span>₹{o.total}</span></div>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white p-3 border border-black/5">
                          <div className="text-xs font-bold text-black/50">Payment</div>
                          <div className="font-bold">{o.payment_method} • {o.payment_status}</div>
                          <div className="text-xs text-black/60">{o.created_at}</div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-2xl bg-white border border-black/5 overflow-hidden">
                        <div className="px-4 py-2 bg-[#fff7ed]/60 border-b border-black/5 text-xs font-black">ITEMS • {o.items.length}</div>
                        <div className="divide-y divide-black/5">
                          {o.items.map((it: any) => (
                            <div key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
                              <div>
                                <div className="text-sm font-bold">{it.name} {it.variant && <span className="text-xs font-semibold text-black/50">• {it.variant}</span>}</div>
                                <div className="text-xs text-black/50">Qty {it.quantity} • ₹{it.unit_price} each</div>
                              </div>
                              <div className="text-sm font-black">₹{it.total_price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
