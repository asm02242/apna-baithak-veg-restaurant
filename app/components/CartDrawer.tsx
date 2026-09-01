"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart, AVAILABLE_OFFERS, FREE_DELIVERY_THRESHOLD } from "../context/CartContext";
import { SITE } from "@/lib/site";
import { bestSellers } from "@/data/menu";

export default function CartDrawer() {
  const {
    cart,
    bill,
    count,
    isCartOpen,
    closeCart,
    increase,
    decrease,
    removeFromCart,
    clearCart,
    addToCart,
    selectedOffer,
    setSelectedOffer,
    eligibleOffers,
    subtotal,
    tip,
    setTip,
    deliveryType,
  unavailableItems } = useCart();
  const [showBill, setShowBill] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isCartOpen) return null;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const r = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim().toUpperCase(), cartTotal: subtotal }),
      });
      const d = await r.json();
      if (!r.ok || !d.valid) throw new Error(d.error || "Invalid coupon");
      // map validated coupon to offer-like selection if matches
      setCouponMsg({ type: "ok", text: `${d.code} applied • -₹${d.discount}` });
      // keep discount via coupon — for now we show message, bill still via offers; coupon discount will be handled on checkout POST
    } catch (e: any) {
      setCouponMsg({ type: "err", text: e.message || "Invalid coupon" });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={closeCart} className="absolute inset-0 bg-[#1c0a00]/45 backdrop-blur-[2px]" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#fff7ed] shadow-[-20px_0_48px_rgba(28,10,0,0.22)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-black/5 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1c0a00] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
              </div>
              <div>
                <div className="text-[13px] font-black leading-none text-[#1c0a00]">
                  {deliveryType === "delivery" ? "Delivery in 32 minutes" : deliveryType === "takeaway" ? "Takeaway • Ready in 20 min" : "Dine-in • Visit us"}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-black/50">{count} items • {SITE.name} • 100% Pure Veg</div>
              </div>
            </div>
            <button onClick={closeCart} className="inline-flex items-center gap-1.5 rounded-full bg-[#1c0a00] px-3.5 py-2 text-xs font-black text-white hover:bg-black transition">✕ Close</button>
          </div>
          <div className="mt-3 rounded-2xl bg-[#fff7ed] border border-black/5 px-3.5 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-[#1c0a00]">{deliveryType === "delivery" ? "Deliver to" : "Service mode"}</div>
              <div className="text-xs text-black/55 leading-tight max-w-[220px] truncate">
                {deliveryType === "delivery" ? SITE.fullAddress : deliveryType === "takeaway" ? "Takeaway from counter" : "Dine-in at restaurant"}
              </div>
            </div>
            <Link href="/checkout" onClick={closeCart} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-[#ea580c] ring-1 ring-black/5">Change</Link>
          </div>
        </div>

        {/* Progress */}
        {mounted && cart.length > 0 && (
          <div className="mx-3 mt-3 rounded-2xl bg-white border border-[#facc15]/30 px-3.5 py-3 shadow-sm">
            {bill.isFreeDelivery ? (
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#16a34a] text-white text-sm">✓</span>
                <div>
                  <div className="text-xs font-black text-[#16a34a]">Yay! You got FREE delivery</div>
                  <div className="text-[11px] text-black/50">on orders ₹{FREE_DELIVERY_THRESHOLD}+</div>
                </div>
                <span className="ml-auto rounded-full bg-[#f0fdf4] px-2 py-1 text-[10px] font-black text-[#16a34a] border border-[#16a34a]/15">Saved ₹40</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ea580c] animate-pulse" /> Add ₹{bill.freeDeliveryRemaining} more for FREE delivery</span>
                  <span className="text-black/50">{bill.freeDeliveryProgress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#fff7ed] border border-black/5">
                  <div className="h-full rounded-full bg-[#ea580c] transition-all" style={{ width: `${bill.freeDeliveryProgress}%` }} />
                </div>
                <div className="mt-1.5 text-[11px] text-black/55">Shop for ₹{FREE_DELIVERY_THRESHOLD} to save ₹40 delivery fee</div>
              </>
            )}
          </div>
        )}

        {/* Unavailable items warning */}
        {mounted && unavailableItems.length > 0 && (
          <div className="mx-3 mt-3 rounded-2xl bg-[#fef2f2] border border-red-200 px-3.5 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white text-sm">⚠</span>
              <div>
                <div className="text-xs font-black text-red-600">Some items are no longer available</div>
                <div className="text-[11px] text-red-500">
                  {unavailableItems.map((it) => it.name).join(", ")} — please remove or wait for restock
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll */}
        <div className="flex-1 overflow-auto">
          {!mounted ? (
            <div className="p-4"><div className="h-24 rounded-2xl bg-white shimmer" /></div>
          ) : cart.length === 0 ? (
            <div className="p-4">
              <div className="rounded-[24px] bg-white p-8 text-center ring-1 ring-black/5">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff7ed] text-2xl">🛒</div>
                <div className="mt-3 text-base font-black">Your cart is empty</div>
                <div className="mt-1 text-xs leading-5 text-black/60">Add dishes like momos, chaap, noodles & more — delivery in 32 minutes</div>
                <Link href="/menu" onClick={closeCart} className="mt-5 inline-flex rounded-full bg-[#ea580c] px-6 py-2.5 text-xs font-black text-white hover:bg-[#c2410c]">Browse Menu →</Link>
              </div>
              <div className="mt-4 rounded-[20px] bg-white p-4 ring-1 ring-black/5">
                <div className="text-xs font-black">Trending near you</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {bestSellers.slice(0, 4).map((it) => (
                    <div key={it.id} className="rounded-2xl border border-black/5 bg-[#fff7ed] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt={it.name} className="h-16 w-full object-cover rounded-xl bg-white" />
                      <div className="mt-2 text-xs font-bold line-clamp-1">{it.name}</div>
                      <div className="text-xs font-black">₹{it.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* Items */}
              <div className="rounded-[20px] bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between bg-[#fff7ed]/60 border-b border-black/5">
                  <span className="text-xs font-black tracking-wide">YOUR CART • {count} ITEMS</span>
                  <button onClick={clearCart} className="text-xs font-bold text-[#e11d48] hover:underline">Clear all</button>
                </div>
                <div className="divide-y divide-black/5">
                  {cart.map((it) => {
                    const variantLabel = (it as any).variant ? ((it as any).variant === "half" ? "Half" : (it as any).variant === "full" ? "Full" : (it as any).variant) : null;
                    return (
                      <div key={`${it.id}-${(it as any).variant || "single"}`} className="flex gap-3 px-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#fff7ed] ring-1 ring-black/5">
                          {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-xl">🍽️</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1.5">
                            <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-[4px] border border-[#16a34a] shrink-0"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /></span>
                            <div className="text-[13px] font-bold leading-tight line-clamp-2 text-[#1c0a00]">{it.name}</div>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-black/50">{it.category ?? "Apna Baithak"}</span>
                            {variantLabel && <span className="rounded-full bg-[#fff7ed] border border-black/5 px-2 py-0.5 text-[11px] font-bold">{variantLabel}</span>}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-sm font-black">₹{it.price}</span>
                            <span className="text-xs text-black/35 line-through">₹{Math.round(it.price * 1.12)}</span>
                            <button onClick={() => removeFromCart(it.id)} className="ml-auto text-xs font-bold text-black/40 hover:text-[#e11d48]">Remove</button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-2">
                          <div className="flex items-center rounded-xl border border-[#ea580c] bg-[#ea580c] p-1 gap-1">
                            <button onClick={() => decrease(it.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#ea580c] font-black">−</button>
                            <span className="min-w-[28px] text-center text-xs font-black text-white">{it.quantity}</span>
                            <button onClick={() => increase(it.id)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#ea580c] font-black">+</button>
                          </div>
                          <div className="text-sm font-black">₹{it.price * it.quantity}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/menu" onClick={closeCart} className="flex items-center justify-center gap-1 border-t border-black/5 bg-white px-3 py-3 text-xs font-black text-[#ea580c] hover:bg-[#fff7ed]">+ Add more items</Link>
              </div>

              {/* Coupon */}
              <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5 text-sm">🏷️</span>
                  <div className="text-xs font-black">Apply coupon</div>
                  {couponMsg && <span className={`ml-auto rounded-full px-2 py-1 text-[11px] font-bold ${couponMsg.type === "ok" ? "bg-[#f0fdf4] text-[#16a34a] border border-[#16a34a]/15" : "bg-[#fef2f2] text-[#e11d48] border border-red-200"}`}>{couponMsg.text}</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 rounded-full border border-black/10 bg-[#fff7ed] px-4 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20" />
                  <button onClick={applyCoupon} disabled={couponLoading} className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-xs font-black text-white disabled:opacity-60">{couponLoading ? "…" : "Apply"}</button>
                </div>
                <div className="mt-2 text-[11px] text-black/45">Coupons are validated on checkout • Only one coupon per order</div>
              </div>

              {/* Offers */}
              <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fef3c7] text-sm">🎁</span>
                  <div>
                    <div className="text-xs font-black">Choose one offer</div>
                    <div className="text-xs text-black/50">{selectedOffer ? `${selectedOffer.label} applied` : "Select an offer below"}</div>
                  </div>
                  {selectedOffer && <button onClick={() => setSelectedOffer(null)} className="ml-auto rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-bold text-white">Remove</button>}
                </div>
                {eligibleOffers.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {eligibleOffers.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : { id: o.id, label: o.label, type: o.type, discount: o.value, freeItemValue: o.freeItemValue, desc: o.desc })}
                        className={`text-left rounded-2xl border-2 px-3 py-3 transition ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-[#fff7ed] hover:bg-white"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[9px] ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/15"}`}>{selectedOffer?.id === o.id ? "✓" : ""}</span>
                          <span className="text-xs font-black">{o.label}</span>
                          {o.type === "bulk" && <span className="ml-auto rounded-full bg-[#16a34a] px-2 py-0.5 text-[10px] font-bold text-white">Bulk</span>}
                        </div>
                        <div className="mt-1 ml-6 text-xs text-black/55 leading-snug">{o.desc}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl bg-[#fff7ed] border border-dashed border-black/10 px-3 py-3 text-xs">
                    Next offer at ₹{AVAILABLE_OFFERS[0]?.minOrder} — add ₹{Math.max(0, (AVAILABLE_OFFERS[0]?.minOrder || 0) - subtotal)} more
                  </div>
                )}
                <div className="mt-2 text-[11px] text-black/40">Only one offer per order</div>
              </div>

              {/* Bill */}
              <div className="rounded-[20px] bg-white ring-1 ring-black/5 shadow-sm overflow-hidden">
                <button onClick={() => setShowBill((v) => !v)} className="flex w-full items-center justify-between px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-black"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">🧾</span> Bill details</span>
                  <span className="text-xs font-bold text-black/40">{showBill ? "▲" : "▼"}</span>
                </button>
                {showBill && (
                  <div className="px-5 pb-4 text-sm space-y-2.5 border-t border-black/5 pt-3">
                    <div className="flex justify-between"><span className="text-black/55">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
                    <div className="flex justify-between"><span className="text-black/55">Handling charge</span><span className="font-bold">₹{bill.handlingFee}</span></div>
                    <div className="flex justify-between"><span className="text-black/55">Delivery fee {bill.isFreeDelivery && bill.subtotal > 0 && <span className="text-[#16a34a]">(FREE)</span>}</span><span className={`font-bold ${bill.isFreeDelivery && bill.deliveryFee === 0 ? "line-through text-black/30" : ""}`}>₹{bill.deliveryFee}</span></div>
                    {bill.smallCartFee > 0 && <div className="flex justify-between text-[#e11d48]"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
                    {bill.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Offer discount</span><span className="font-bold">-₹{bill.discount}</span></div>}
                    {tip > 0 && <div className="flex justify-between"><span className="text-black/55">Tip for rider</span><span className="font-bold">₹{tip}</span></div>}
                    <div className="flex justify-between border-t border-black/5 pt-3 text-base font-black"><span>To pay</span><span>₹{bill.grandTotal}</span></div>
                    {bill.savings > 0 && <div className="rounded-2xl bg-[#fff7ed] border border-[#ea580c]/15 px-3 py-2.5 text-center text-xs font-bold text-[#ea580c]">You saved ₹{bill.savings} on this order 🎉</div>}
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="rounded-[20px] bg-white p-4 ring-1 ring-black/5 shadow-sm">
                <div className="text-sm font-black">Tip your delivery partner</div>
                <div className="text-xs text-black/50">Optional • 100% goes to rider</div>
                <div className="mt-3 flex gap-2">
                  {[0, 10, 20, 30, 50].map((v) => (
                    <button key={v} onClick={() => setTip(v)} className={`flex-1 rounded-full border px-2 py-2 text-xs font-black ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white hover:bg-[#fff7ed] border-black/10"}`}>{v === 0 ? "No tip" : `₹${v}`}</button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#fffbeb] p-3 ring-1 ring-[#f59e0b]/20">
                <div className="text-xs font-bold text-[#92400e]">Cancellation policy</div>
                <div className="text-xs leading-snug text-black/60">Orders cannot be cancelled once packed. Delivery in ~32 mins or apology coupon. Fees & taxes included.</div>
              </div>

              <div className="rounded-[20px] bg-white p-3 ring-1 ring-black/5 shadow-sm">
                <div className="text-xs font-black">You may also like</div>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {bestSellers.slice(0, 6).map((it) => (
                    <div key={it.id} className="w-[132px] shrink-0 rounded-2xl border border-black/5 bg-white p-2">
                      <img src={it.image} alt={it.name} className="h-16 w-full object-cover rounded-xl bg-[#fff7ed]" />
                      <div className="mt-2 line-clamp-1 text-xs font-bold">{it.name}</div>
                      <div className="text-xs font-black">₹{it.price}</div>
                      <button onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, category: it.category })} className="mt-2 w-full rounded-full border border-[#ea580c] bg-white py-1.5 text-xs font-black text-[#ea580c] hover:bg-[#ea580c] hover:text-white">Add +</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {mounted && cart.length > 0 && (
          <div className="border-t border-black/5 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-black/40 line-through">{bill.discount > 0 ? `₹${bill.subtotal + bill.handlingFee + bill.deliveryFee + bill.smallCartFee}` : ""}</div>
                <div className="text-xl font-black leading-none">₹{bill.grandTotal}</div>
                <div className="text-xs font-bold text-[#16a34a]">{bill.savings > 0 ? `SAVING ₹${bill.savings}` : "Inclusive of charges"}</div>
              </div>
              <Link href="/checkout" onClick={closeCart} className="inline-flex items-center gap-2 rounded-2xl bg-[#ea580c] px-6 py-3 text-sm font-black text-white hover:bg-[#c2410c] shadow">Checkout <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">→</span></Link>
            </div>
            {(SITE.whatsapp || SITE.phone) && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SITE.whatsapp && <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" rel="noopener" className="rounded-full bg-[#f0fdf4] border border-[#16a34a]/15 py-2 text-center text-xs font-black text-[#16a34a]">WhatsApp</a>}
                {SITE.phone && <a href={`tel:${SITE.phone}`} className="rounded-full bg-[#1c0a00] py-2 text-center text-xs font-bold text-white">Call • {SITE.phoneDisplay}</a>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
