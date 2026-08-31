"use client";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { useCart, FREE_DELIVERY_THRESHOLD } from "../context/CartContext";
import { SITE } from "@/lib/site";
import { bestSellers } from "@/data/menu";

export default function CartPage() {
  const { cart, bill, count, increase, decrease, removeFromCart, clearCart, tip, setTip, selectedOffer, setSelectedOffer, eligibleOffers, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!coupon.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.trim().toUpperCase(), cartTotal: subtotal }) });
      const d = await r.json();
      if (!r.ok || !d.valid) throw new Error(d.error || "Invalid coupon");
      setMsg({ type: "ok", text: `${d.code} • -₹${d.discount} off` });
    } catch (e: any) {
      setMsg({ type: "err", text: e.message || "Invalid code" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff7ed]">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#1c0a00]">Your Cart</h1>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black ring-1 ring-black/5">{count} items</span>
            {count > 0 && <button onClick={clearCart} className="ml-auto rounded-full bg-white px-4 py-2 text-xs font-black ring-1 ring-black/5 hover:bg-[#fef2f2] hover:text-[#e11d48]">Clear cart</button>}
          </div>

          {cart.length === 0 ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-[24px] bg-white p-10 text-center ring-1 ring-black/5 shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] text-3xl">🛒</div>
                <div className="mt-3 text-lg font-black">Cart is empty</div>
                <p className="mt-1 text-sm text-black/60">Add chaap, momos, noodles & more — delivery in 32 minutes</p>
                <Link href="/menu" className="mt-6 inline-flex rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white hover:bg-[#c2410c]">Browse Menu →</Link>
              </div>
              <div className="rounded-[24px] bg-white p-5 ring-1 ring-black/5">
                <div className="text-sm font-black">Trending near you</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {bestSellers.slice(0, 4).map((it) => (
                    <div key={it.id} className="rounded-2xl border border-black/5 bg-[#fff7ed] p-2">
                      <img src={it.image} alt={it.name} className="h-20 w-full rounded-xl object-cover bg-white" />
                      <div className="mt-2 text-xs font-bold line-clamp-1">{it.name}</div>
                      <div className="text-xs font-black">₹{it.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="space-y-4">
                <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5 shadow-sm flex items-center justify-between">
                  {bill.isFreeDelivery ? (
                    <span className="flex items-center gap-2 text-xs font-black text-[#16a34a]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#16a34a] text-white">✓</span> FREE delivery unlocked • Saved ₹40</span>
                  ) : (
                    <span className="text-xs font-bold">Add ₹{bill.freeDeliveryRemaining} more for FREE delivery</span>
                  )}
                  <span className="text-xs font-bold text-black/40">{bill.freeDeliveryProgress}%</span>
                </div>
                <div className="rounded-[24px] bg-white ring-1 ring-black/5 shadow-sm overflow-hidden divide-y divide-black/5">
                  {cart.map((it) => {
                    const variant = (it as any).variant as string | undefined;
                    return (
                      <div key={`${it.id}-${variant || "single"}`} className="flex gap-4 p-4">
                        <img src={it.image} alt={it.name} className="h-20 w-20 rounded-2xl object-cover bg-[#fff7ed] ring-1 ring-black/5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1.5">
                            <span className="mt-1 grid h-4 w-4 place-items-center rounded-[4px] border border-[#16a34a] shrink-0"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /></span>
                            <div>
                              <div className="text-sm font-bold leading-tight text-[#1c0a00]">{it.name}</div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-xs text-black/55">{it.category || "Apna Baithak"}</span>
                                {variant && <span className="rounded-full bg-[#fff7ed] border border-black/5 px-2 py-0.5 text-xs font-bold capitalize">{variant}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-black/10 bg-white p-1">
                              <button onClick={() => decrease(it.id)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5 font-black">−</button>
                              <span className="min-w-[36px] text-center text-sm font-black">{it.quantity}</span>
                              <button onClick={() => increase(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-[#ea580c] text-white font-black">+</button>
                            </div>
                            <button onClick={() => removeFromCart(it.id)} className="text-xs font-bold text-[#e11d48] hover:underline">Remove</button>
                            <span className="ml-auto text-sm font-black">₹{it.price * it.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/menu" className="inline-flex rounded-full bg-white px-5 py-2.5 text-xs font-black ring-1 ring-black/5">← Continue shopping</Link>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] bg-white p-5 ring-1 ring-black/5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5 text-sm">🏷️</span>
                    <span className="text-sm font-black">Coupon</span>
                    {msg && <span className={`ml-auto rounded-full px-2 py-1 text-xs font-bold ${msg.type === "ok" ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#fef2f2] text-[#e11d48]"}`}>{msg.text}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon" className="flex-1 rounded-full border border-black/10 bg-[#fff7ed] px-4 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20" />
                    <button onClick={apply} disabled={loading} className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-xs font-black text-white disabled:opacity-60">{loading ? "…" : "Apply"}</button>
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-5 ring-1 ring-black/5 shadow-sm">
                  <div className="text-sm font-black">Offers</div>
                  <div className="mt-3 grid gap-2">
                    {eligibleOffers.length === 0 ? (
                      <div className="rounded-2xl bg-[#fff7ed] border border-dashed px-3 py-3 text-xs">Add ₹{Math.max(0, (FREE_DELIVERY_THRESHOLD || 399) - subtotal)} more to unlock offers. Wishlist for more savings.</div>
                    ) : (
                      eligibleOffers.map((o) => (
                        <button key={o.id} onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : { id: o.id, label: o.label, type: o.type, discount: o.value, freeItemValue: o.freeItemValue, desc: o.desc })} className={`text-left rounded-2xl border-2 p-3 ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-[#fff7ed]"}`}>
                          <div className="text-xs font-black">{o.label}</div>
                          <div className="text-xs text-black/60">{o.desc}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-5 ring-1 ring-black/5 shadow-sm">
                  <div className="text-sm font-black">Tip rider</div>
                  <div className="mt-2 flex gap-2">
                    {[0, 10, 20, 30, 50].map((v) => (
                      <button key={v} onClick={() => setTip(v)} className={`flex-1 rounded-full border px-2 py-2 text-xs font-black ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white border-black/10"}`}>{v === 0 ? "No tip" : `₹${v}`}</button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-5 ring-1 ring-black/5 shadow-sm">
                  <div className="text-sm font-black">Bill details</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-black/55">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
                    <div className="flex justify-between"><span className="text-black/55">Handling</span><span className="font-bold">₹{bill.handlingFee}</span></div>
                    <div className="flex justify-between"><span className="text-black/55">Delivery {bill.isFreeDelivery ? <span className="text-[#16a34a]">(FREE)</span> : null}</span><span className="font-bold">₹{bill.deliveryFee}</span></div>
                    {bill.smallCartFee > 0 && <div className="flex justify-between text-[#e11d48]"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
                    {bill.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Discount</span><span className="font-bold">-₹{bill.discount}</span></div>}
                    {tip > 0 && <div className="flex justify-between"><span className="text-black/55">Tip</span><span className="font-bold">₹{tip}</span></div>}
                    <div className="flex justify-between border-t border-black/5 pt-3 text-base font-black"><span>To pay</span><span>₹{bill.grandTotal}</span></div>
                    {bill.savings > 0 && <div className="rounded-2xl bg-[#fff7ed] border border-[#ea580c]/15 px-3 py-2 text-center text-xs font-bold text-[#ea580c]">You saved ₹{bill.savings} 🎉</div>}
                  </div>
                  <Link href="/checkout" className="mt-4 flex w-full items-center justify-center rounded-full bg-[#ea580c] py-3.5 text-sm font-black text-white hover:bg-[#c2410c]">Proceed to Checkout →</Link>
                  <div className="mt-2 flex gap-2">
                    <a href={`tel:${SITE.phone}`} className="flex-1 rounded-full bg-[#1c0a00] py-2 text-center text-xs font-bold text-white">{SITE.phoneDisplay}</a>
                    {SITE.whatsapp && <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="flex-1 rounded-full border bg-white py-2 text-center text-xs font-bold">WhatsApp</a>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
