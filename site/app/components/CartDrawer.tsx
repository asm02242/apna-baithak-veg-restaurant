"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart, AVAILABLE_OFFERS, FREE_DELIVERY_THRESHOLD } from "../context/CartContext";
import { SITE } from "@/lib/site";
import { bestSellers } from "@/data/menu";

export default function CartDrawer() {
  const {
    cart,
    subtotal,
    total,
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
    tip,
    setTip,
    deliveryType,
  } = useCart();
  const [showBill, setShowBill] = useState(true);

  if (!isCartOpen) return null;

  const progress = bill.freeDeliveryProgress;
  const remaining = bill.freeDeliveryRemaining;

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={closeCart} className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[360px] bg-[#f7f7f7] shadow-[-16px_0_48px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden">
        {/* Header - Blinkit style */}
        <div className="bg-white border-b px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#ea580c] text-white text-xs font-black">⌚</div>
              <div>
                <div className="text-xs font-black leading-none text-[#1c0a00]">
                  {deliveryType === "delivery" ? "Delivery in 32 minutes" : deliveryType === "takeaway" ? "Takeaway • Ready in 20 mins" : "Dine-in • Visit us"}
                </div>
                <div className="text-[10px] font-semibold text-[#ea580c]">{count} items • {SITE.name}</div>
              </div>
            </div>
            <button onClick={closeCart} aria-label="Close cart" className="inline-flex items-center gap-1 rounded-full bg-[#1c0a00] px-3 py-1.5 text-[10px] font-black text-white hover:bg-black border border-white/10 shadow">
              <span className="text-xs">✕</span> Close
            </button>
          </div>
          {/* Blinkit-like address preview */}
          <div className="mt-3 rounded-xl bg-[#f7f7f7] px-3 py-2 flex items-center justify-between">
            <div className="text-[10px]">
              <div className="font-bold text-[#1c0a00]">{deliveryType === "delivery" ? "Deliver to" : "Service mode"}</div>
              <div className="text-black/60 leading-tight">
                {deliveryType === "delivery" ? SITE.fullAddress : deliveryType === "takeaway" ? "Takeaway from counter" : "Dine-in at restaurant"}
              </div>
            </div>
            <Link href="/checkout" onClick={closeCart} className="text-[10px] font-bold text-[#ea580c]">Change</Link>
          </div>
        </div>

        {/* Shipment / free delivery progress - Blinkit yellow banner */}
        {cart.length > 0 && (
          <div className="mx-2 mt-2 rounded-xl bg-white border border-[#facc15]/40 px-2 py-2 shadow-sm">
            {bill.isFreeDelivery ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ea580c] text-white">✓</span>
                <span className="font-bold text-[#ea580c]">Yay! You got FREE delivery</span>
                <span className="ml-auto text-[10px] font-bold text-black/40 bg-[#f7f7f7] px-2 py-1 rounded-full">on ₹{FREE_DELIVERY_THRESHOLD}+</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b] animate-pulse" /> Add ₹{remaining} more for FREE delivery</span>
                  <span className="text-black/60">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6]">
                  <div className="h-full rounded-full bg-[#facc15] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-black/60">Shop for ₹{FREE_DELIVERY_THRESHOLD} to save ₹40 delivery fee</div>
              </>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="grid place-items-center py-14 px-6 text-center bg-white m-3 rounded-xl">
              <div className="text-6xl">🛒</div>
              <div className="mt-3 font-black text-base">Your cart is empty</div>
              <div className="text-xs text-black/60">Add dishes like momos, chaap, noodles & more — delivery in minutes</div>
              <a href="#menu" onClick={closeCart} className="mt-5 rounded-full bg-[#ea580c] px-6 py-1.5 text-xs font-black text-white hover:bg-[#c2410c]">Browse Menu</a>
              <div className="mt-8 w-full text-left">
                <div className="text-xs font-black">Trending near you</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {bestSellers.slice(0, 4).map((it) => (
                    <div key={it.id} className="rounded-xl border bg-[#f7f7f7] p-2">
                      <img src={it.image} alt={it.name} className="h-16 w-full object-cover rounded-lg" />
                      <div className="mt-1 text-[10px] font-bold line-clamp-1">{it.name}</div>
                      <div className="text-[10px] font-black">₹{it.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Cart items card - Blinkit white card with quantity */}
              <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between border-b bg-[#f7f7f7]/60">
                  <span className="text-[10px] font-black tracking-wide">YOUR CART • {count} ITEMS</span>
                  <button onClick={clearCart} className="text-[10px] font-bold text-[#e11d48] hover:underline">Clear all</button>
                </div>
                <div className="divide-y">
                  {cart.map((it) => (
                    <div key={it.id} className="flex gap-2 px-2 py-2">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] ring-1 ring-black/5">
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xl">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1">
                          <span className="mt-[2px] grid h-[14px] w-[14px] place-items-center rounded-[3px] border border-[#16a34a] shrink-0">
                            <span className="h-[7px] w-[7px] rounded-full bg-[#16a34a]" />
                          </span>
                          <div className="text-xs font-bold leading-tight line-clamp-2 text-[#1c0a00]">{it.name}</div>
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-black/50">{it.category ?? "Apna Baithak"} • 1 plate</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-black">₹{it.price}</span>
                          <span className="text-[10px] text-black/40 line-through">₹{Math.round(it.price * 1.12)}</span>
                          <button onClick={() => removeFromCart(it.id)} className="ml-auto text-[10px] font-bold text-black/40 hover:text-red-600">Remove</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="flex items-center rounded-lg border border-[#ea580c] bg-[#ea580c] p-0.5">
                          <button onClick={() => decrease(it.id)} className="grid h-6 w-6 place-items-center rounded-md bg-white text-[#ea580c] font-black text-xs">−</button>
                          <span className="min-w-[28px] text-center text-[10px] font-black text-white">{it.quantity}</span>
                          <button onClick={() => increase(it.id)} className="grid h-6 w-6 place-items-center rounded-md bg-white text-[#ea580c] font-black text-xs">+</button>
                        </div>
                        <div className="text-[10px] font-black">₹{it.price * it.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* add more */}
                <Link href="/#menu" onClick={closeCart} className="flex items-center justify-center gap-1 border-t bg-white px-2 py-1.5 text-[10px] font-bold text-[#ea580c] hover:bg-[#f7f7f7]">
                  + Add more items
                </Link>
              </div>

              {/* Offers - choose only ONE */}
              <div className="rounded-xl bg-white p-2 ring-1 ring-black/5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fef3c7] text-xs">🎁</span>
                  <div className="flex-1">
                    <div className="text-[10px] font-black">Choose one offer</div>
                    <div className="text-[10px] text-black/60">{selectedOffer ? `${selectedOffer.label} applied` : "Select an offer below"}</div>
                  </div>
                  {selectedOffer && (
                    <button onClick={() => setSelectedOffer(null)} className="rounded-full bg-black px-3 py-1.5 text-[10px] font-bold text-white">Remove</button>
                  )}
                </div>
                {eligibleOffers.length > 0 ? (
                  <div className="mt-2 grid gap-1.5">
                    {eligibleOffers.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : { id: o.id, label: o.label, type: o.type, discount: o.value, freeItemValue: o.freeItemValue, desc: o.desc })}
                        className={`text-left rounded-lg border-2 px-2.5 py-1.5 transition ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#fff7ed]" : "border-transparent bg-[#f7f7f7]"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`grid h-3.5 w-3.5 place-items-center rounded-full border text-[8px] ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/20"}`}>{selectedOffer?.id === o.id ? "✓" : ""}</span>
                          <span className="text-[10px] font-black">{o.label}</span>
                          {o.type === "bulk" && <span className="ml-auto text-[9px] font-bold bg-[#16a34a] text-white px-1.5 py-0.5 rounded-full">Bulk</span>}
                        </div>
                        <div className="text-[9px] text-black/50 mt-0.5 ml-5">{o.desc}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg bg-[#f7f7f7] px-2.5 py-2 text-[10px]">
                    Next offer at ₹{AVAILABLE_OFFERS[0]?.minOrder} — add ₹{Math.max(0, (AVAILABLE_OFFERS[0]?.minOrder || 0) - subtotal)} more
                  </div>
                )}
                <div className="mt-1.5 text-[9px] text-black/40">Only one offer per order</div>
              </div>

              {/* Bill details */}
              <div className="rounded-xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden">
                <button onClick={() => setShowBill((v) => !v)} className="flex w-full items-center justify-between px-3 py-2">
                  <span className="text-xs font-black flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f7f7f7] text-[10px]">🧾</span> Bill details</span>
                  <span className="text-[10px] font-bold text-black/50">{showBill ? "▲" : "▼"}</span>
                </button>
                {showBill && (
                  <div className="px-4 pb-3 text-[10px] space-y-2 border-t pt-3">
                    <div className="flex justify-between"><span className="text-black/60">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
                    <div className="flex justify-between"><span className="text-black/60">Handling charge</span><span className="font-bold">₹{bill.handlingFee}</span></div>
                    <div className="flex justify-between"><span className="text-black/60">Delivery fee {bill.isFreeDelivery && bill.subtotal > 0 && <span className="text-[#ea580c]">(FREE)</span>}</span>
                      <span className={`font-bold ${bill.isFreeDelivery ? "line-through text-black/40" : ""}`}>₹{bill.isFreeDelivery ? "0" : bill.deliveryFee}</span>
                    </div>
                    {bill.smallCartFee > 0 && <div className="flex justify-between text-[#e11d48]"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
                    {bill.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Offer discount</span><span className="font-bold">-₹{bill.discount}</span></div>}
                    {tip > 0 && <div className="flex justify-between"><span className="text-black/60">Tip for rider</span><span className="font-bold">₹{tip}</span></div>}
                    <div className="flex justify-between border-t pt-2 text-xs font-black"><span>To pay</span><span>₹{bill.grandTotal}</span></div>
                    {bill.savings > 0 && <div className="rounded-xl bg-[#fff7ed] px-3 py-2 text-center text-[10px] font-bold text-[#ea580c]">You saved ₹{bill.savings} 🎉</div>}
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="rounded-xl bg-white p-2 ring-1 ring-black/5 shadow-sm">
                <div className="text-[10px] font-black">Tip your delivery partner</div>
                <div className="text-[10px] text-black/60">Optional • 100% goes to rider</div>
                <div className="mt-2 flex gap-2">
                  {[0, 10, 20, 30, 50].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTip(v)}
                      className={`flex-1 rounded-full border px-2 py-1.5 text-[10px] font-black ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white hover:bg-[#f7f7f7]"}`}
                    >
                      {v === 0 ? "No tip" : `₹${v}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cancellation & note */}
              <div className="rounded-xl bg-[#fffbeb] p-2 ring-1 ring-[#f59e0b]/20">
                <div className="text-[10px] font-bold text-[#92400e]">Cancellation policy</div>
                <div className="text-[10px] leading-tight text-black/60">Orders cannot be cancelled once packed. Deliver in 30 mins or get apology coupon. Fees & taxes extra.</div>
              </div>

              {/* Recommendation */}
              <div className="rounded-xl bg-white p-2 ring-1 ring-black/5 shadow-sm">
                <div className="text-[10px] font-black">You may also like</div>
                <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                  {bestSellers.slice(0, 6).map((it) => (
                    <div key={it.id} className="w-[112px] shrink-0 rounded-xl border bg-white p-2">
                      <img src={it.image} alt={it.name} className="h-16 w-full object-cover rounded-lg" />
                      <div className="mt-1 line-clamp-1 text-[10px] font-bold">{it.name}</div>
                      <div className="text-[10px] font-black">₹{it.price}</div>
                      <button onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, category: it.category })} className="mt-1 w-full rounded-full border border-[#ea580c] bg-white py-1 text-[10px] font-black text-[#ea580c] hover:bg-[#ea580c] hover:text-white">Add</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* Footer Blinkit sticky */}
        {cart.length > 0 && (
          <div className="border-t bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-black/60 line-through">{bill.discount > 0 ? `₹${bill.subtotal + bill.handlingFee + bill.deliveryFee + bill.smallCartFee}` : ""}</div>
                <div className="text-base font-black leading-none">₹{bill.grandTotal}</div>
                <div className="text-[10px] font-bold text-[#ea580c]">{bill.savings > 0 ? `SAVING ₹${bill.savings}` : "No extra fees"}</div>
              </div>
              <Link href="/checkout" onClick={closeCart} className="flex items-center gap-2 rounded-xl bg-[#ea580c] px-5 py-2 text-xs font-black text-white hover:bg-[#c2410c] shadow">
                Checkout <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c] text-[10px]">→</span>
              </Link>
            </div>
            <div className="mt-2 flex gap-2">
              <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="flex-1 rounded-full bg-[#fff7ed] py-2 text-center text-[10px] font-black text-[#ea580c] border">WhatsApp</a>
              <a href={`https://wa.me/91${SITE.whatsappSecondary}`} target="_blank" className="flex-1 rounded-full bg-[#f0fdf4] py-2 text-center text-[10px] font-black text-[#16a34a] border">WhatsApp</a>
              <a href={`tel:${SITE.phone}`} className="flex-1 rounded-full bg-[#1c0a00] py-2 text-center text-[10px] font-bold text-white">Call • {SITE.phoneDisplay}</a>
              <a href={`tel:${SITE.phoneSecondary}`} className="flex-1 rounded-full border bg-white py-2 text-center text-[10px] font-bold text-[#1c0a00]">Call • {SITE.phoneDisplaySecondary}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
