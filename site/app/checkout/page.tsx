"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCart, AVAILABLE_OFFERS } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SITE } from "@/lib/site";

type Address = { id: string; label: string; title: string; full: string; phone: string };

const SAVED_ADDRESSES: Address[] = [
  { id: "home", label: "HOME", title: "Home • Eldeco City", full: "Eldeco City, IIM Road, Lucknow • House/Flat No", phone: SITE.phoneDisplay },
  { id: "work", label: "WORK", title: "Work • Office", full: "Add work address for faster checkout", phone: "" },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { cart, subtotal, bill, count, increase, decrease, removeFromCart, clearCart, tip, setTip, deliveryType, setDeliveryType, selectedOffer, setSelectedOffer, eligibleOffers } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedAddr, setSelectedAddr] = useState<string>("home");
  const SAVED = user
    ? user.addresses.map((a) => ({ id: a.id, label: a.label.toUpperCase(), title: `${a.label} • ${a.full.slice(0, 30)}`, full: a.full, phone: user.phone || SITE.phoneDisplay }))
    : SAVED_ADDRESSES;
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (user.addresses[0] && !address) setSelectedAddr(user.addresses[0].id);
    }
  }, [user]);
  const [slot, setSlot] = useState<"now" | "schedule">("now");
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "razorpay">("cod");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit phone required";
    if (deliveryType === "delivery" && !address.trim() && !SAVED.find((a) => a.id === selectedAddr)?.full) e.address = "Delivery address required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const waText = useMemo(() => {
    const addrText = deliveryType === "delivery" ? (address || SAVED.find((a) => a.id === selectedAddr)?.full || "-") : deliveryType;
    const offerText = selectedOffer ? `%0A*Offer Applied:* ${selectedOffer.label}` : "";
    return encodeURIComponent(
      `*APNA BAITHAK - New Order #${orderId || "PREVIEW"}*%0A%0A` +
        cart.map((i) => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join("%0A") +
        offerText +
        `%0A%0A*Bill:* Subtotal ₹${bill.subtotal} | Discount -₹${bill.discount} | Delivery ₹${bill.deliveryFee} | Handling ₹${bill.handlingFee}${bill.smallCartFee ? ` | Small cart ₹${bill.smallCartFee}` : ""}${tip ? ` | Tip ₹${tip}` : ""}%0A*Total: ₹${bill.grandTotal}*%0A*Items: ${count}*%0A%0AName: ${name || "-"}%0APhone: ${phone || "-"}%0AType: ${deliveryType}%0AAddress: ${addrText}%0ASlot: ${slot === "now" ? "Delivery in 32 mins" : `Scheduled ${scheduleTime}`}%0APayment: ${payment}%0ANotes: ${notes || "-"}` +
        `%0A%0A${SITE.mapsLink}`
    );
  }, [cart, bill, count, name, phone, deliveryType, address, selectedAddr, slot, scheduleTime, payment, notes, orderId, selectedOffer]);

  const waLink = `https://wa.me/91${SITE.whatsapp}?text=${waText}`;

  const handlePlace = () => {
    if (!validate()) return;
    const id = `AB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    setOrderId(id);
    setOrderPlaced(true);
    setTimeout(() => window.open(waLink, "_blank"), 800);
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setPayError("");
    setIsPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay. Check internet.");
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bill.grandTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Payment key not configured");
      const options = {
        key,
        amount: data.amount,
        currency: data.currency,
        name: "APNA BAITHAK",
        description: `${count} items • ₹${bill.grandTotal}`,
        image: "/logo-neon.svg",
        order_id: data.id,
        handler: function (response: any) {
          const id = `AB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
          setOrderId(id + ` • ${response.razorpay_payment_id}`);
          setOrderPlaced(true);
          setTimeout(() => window.open(waLink, "_blank"), 800);
        },
        prefill: { name, contact: phone, email: user?.email || "" },
        theme: { color: "#ea580c" },
        modal: { ondismiss: () => setIsPaying(false) },
      };
      const rz = new window.Razorpay(options);
      rz.on("payment.failed", function (resp: any) {
        setPayError(resp.error?.description || "Payment failed");
        setIsPaying(false);
      });
      rz.open();
    } catch (e: any) {
      setPayError(e.message || "Payment error");
      setIsPaying(false);
    }
  };

  const handleDone = () => {
    clearCart();
    setOrderPlaced(false);
    window.location.href = "/";
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
          <div className="text-6xl">🛒</div>
          <h1 className="mt-4 font-black text-2xl">Cart is empty</h1>
          <p className="mt-2 text-sm text-black/60">Add dishes from the menu to checkout — delivery in 32 mins.</p>
          <Link href="/#menu" className="mt-6 inline-flex rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">Browse Menu →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-[1160px] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#facc15] font-black text-sm">AB</div>
            <span className="font-black tracking-tight">APNA BAITHAK</span>
            <span className="hidden sm:inline text-xs font-bold text-black/40">• Checkout</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-[#1c0a00] text-white px-3 py-1.5 rounded-full">{count} items • ₹{bill.grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-4 py-6 grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
        <div className="space-y-4">
          {/* Service mode */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="font-black text-sm">Service mode</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#f7f7f7]">
              {[
                { id: "delivery", label: "Delivery", sub: "32 mins" },
                { id: "takeaway", label: "Takeaway", sub: "20 mins" },
                { id: "dinein", label: "Dine-in", sub: "Visit us" },
              ].map((t) => (
                <button key={t.id} onClick={() => setDeliveryType(t.id as any)} className={`rounded-xl px-3 py-2.5 text-center ${deliveryType === t.id ? "bg-[#ea580c] text-white shadow" : "bg-white"}`}>
                  <div className="text-xs font-black">{t.label}</div>
                  <div className={`text-[11px] ${deliveryType === t.id ? "text-white/80" : "text-black/60"}`}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="font-black text-sm">📍 Delivery address</h2>
            {deliveryType === "delivery" ? (
              <>
                <div className="mt-3 grid gap-2">
                  {SAVED.map((a) => (
                    <button key={a.id} onClick={() => setSelectedAddr(a.id)} className={`text-left rounded-xl border-2 p-3 flex gap-3 ${selectedAddr === a.id ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white"}`}>
                      <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 ${selectedAddr === a.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/20"}`}>{selectedAddr === a.id ? "✓" : ""}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[10px] font-black">{a.label}</span>
                          <span className="text-xs font-bold">{a.title}</span>
                        </div>
                        <div className="text-xs text-black/60 mt-1">{a.full}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.name ? "border-red-500" : ""}`} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone *" inputMode="numeric" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.phone ? "border-red-500" : ""}`} />
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / Flat / Street / Landmark *" rows={2} className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.address ? "border-red-500" : ""}`} />
                </div>
              </>
            ) : (
              <div className="mt-3 grid gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.name ? "border-red-500" : ""}`} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone *" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.phone ? "border-red-500" : ""}`} />
              </div>
            )}
          </div>

          {/* Slot */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="font-black text-sm">⏱️ Delivery slot</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setSlot("now")} className={`rounded-xl border-2 p-3 text-left ${slot === "now" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5"}`}>
                <div className="text-xs font-black">Deliver in 32 min</div>
                <div className="text-[11px] text-black/60">Fastest</div>
              </button>
              <button onClick={() => setSlot("schedule")} className={`rounded-xl border-2 p-3 text-left ${slot === "schedule" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5"}`}>
                <div className="text-xs font-black">Schedule later</div>
                <div className="text-[11px] text-black/60">Pick time</div>
              </button>
            </div>
            {slot === "schedule" && <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-3 rounded-xl border px-3 py-2 text-sm" />}
          </div>

          {/* Notes */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <label className="text-xs font-black">Special instructions</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="No onion, extra spicy..." rows={2} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5 sticky top-[86px]">
            <h2 className="font-black text-sm">🧾 Order summary ({count})</h2>
            <div className="mt-3 divide-y max-h-[200px] overflow-auto">
              {cart.map((it) => (
                <div key={it.id} className="flex gap-3 py-2">
                  <img src={it.image} alt={it.name} className="h-10 w-10 rounded-lg object-cover bg-[#f7f7f7]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold line-clamp-1">{it.name}</div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <button onClick={() => decrease(it.id)} className="grid h-5 w-5 place-items-center rounded-full border text-xs">−</button>
                      <span className="text-xs font-black px-1">{it.quantity}</span>
                      <button onClick={() => increase(it.id)} className="grid h-5 w-5 place-items-center rounded-full bg-[#ea580c] text-white text-xs">+</button>
                    </div>
                  </div>
                  <div className="text-xs font-black">₹{it.price * it.quantity}</div>
                </div>
              ))}
            </div>

            {/* Offers - choose only ONE */}
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#ea580c]/30 bg-[#fff7ed] p-3">
              <div className="text-xs font-black">🎁 Choose one offer</div>
              {eligibleOffers.length === 0 ? (
                <div className="mt-2 space-y-1.5">
                  {AVAILABLE_OFFERS.filter((o) => o.type !== "bulk").slice(0, 2).map((o) => (
                    <div key={o.id} className="rounded-lg bg-white border px-2.5 py-1.5 text-[11px] opacity-50">
                      Add ₹{o.minOrder - subtotal} more: <b>{o.desc}</b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 grid gap-1.5">
                  {eligibleOffers.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : { id: o.id, label: o.label, type: o.type, discount: o.value, freeItemValue: o.freeItemValue, desc: o.desc })}
                      className={`text-left rounded-lg border-2 px-2.5 py-2 transition ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-white" : "border-transparent bg-white hover:border-[#ea580c]/30"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[9px] ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/20"}`}>{selectedOffer?.id === o.id ? "✓" : ""}</span>
                        <span className="text-xs font-black">{o.label}</span>
                        {o.type === "bulk" && <span className="ml-auto text-[10px] font-bold bg-[#16a34a] text-white px-2 py-0.5 rounded-full">Bulk</span>}
                      </div>
                      <div className="text-[10px] text-black/60 mt-0.5 ml-6">{o.desc}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 text-[10px] text-black/40">Rule: Only one offer per order</div>
            </div>

            {/* Tip */}
            <div className="mt-3 rounded-xl bg-[#f7f7f7] p-3">
              <div className="text-xs font-black">Tip rider</div>
              <div className="mt-2 flex gap-1.5">
                {[0, 10, 20, 30, 50].map((v) => (
                  <button key={v} onClick={() => setTip(v)} className={`flex-1 rounded-full px-2 py-1.5 text-xs font-black border ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white"}`}>{v === 0 ? "No tip" : `₹${v}`}</button>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div className="mt-4 space-y-1.5 text-xs border-t pt-3">
              <div className="flex justify-between"><span className="text-black/60">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-black/60">Handling</span><span className="font-bold">₹{bill.handlingFee}</span></div>
              <div className="flex justify-between"><span className="text-black/60">Delivery {bill.isFreeDelivery && <span className="text-[#16a34a]">(FREE)</span>}</span><span className="font-bold">₹{bill.deliveryFee}</span></div>
              {bill.smallCartFee > 0 && <div className="flex justify-between text-red-600"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
              {bill.discount > 0 && <div className="flex justify-between text-[#16a34a]"><span>Offer discount</span><span className="font-bold">-₹{bill.discount}</span></div>}
              {tip > 0 && <div className="flex justify-between"><span className="text-black/60">Tip</span><span className="font-bold">₹{tip}</span></div>}
              <div className="flex justify-between text-sm font-black border-t pt-2"><span>To pay</span><span>₹{bill.grandTotal}</span></div>
              {bill.savings > 0 && <div className="rounded-xl bg-[#fff7ed] px-3 py-2 text-center text-xs font-bold text-[#ea580c]">You saved ₹{bill.savings} 🎉</div>}
              {selectedOffer?.freeItemValue && <div className="rounded-xl bg-[#f0fdf4] px-3 py-2 text-center text-xs font-bold text-[#16a34a]">🎁 Free item worth ₹{selectedOffer.freeItemValue} — mention choice in notes!</div>}
            </div>

            {/* Payment */}
            <div className="mt-4 rounded-xl border p-3">
              <div className="text-xs font-black">Payment method</div>
              <div className="mt-2 grid gap-2">
                <label className={`flex items-center gap-2 rounded-xl border-2 p-2.5 cursor-pointer ${payment === "cod" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5"}`}>
                  <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </label>
                <label className={`flex items-center gap-2 rounded-xl border-2 p-2.5 cursor-pointer ${payment === "razorpay" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5"}`}>
                  <input type="radio" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} />
                  <span className="text-xs font-bold">Pay Online — UPI / Card</span>
                  <span className="ml-auto text-[11px] bg-[#16a34a] text-white px-2 py-0.5 rounded-full">Razorpay</span>
                </label>
              </div>
              {payError && <div className="mt-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600">{payError}</div>}
            </div>

            {payment === "cod" ? (
              <button onClick={handlePlace} className="mt-4 w-full rounded-xl bg-[#ea580c] py-3.5 text-sm font-black text-white hover:bg-[#c2410c]">Place order • ₹{bill.grandTotal}</button>
            ) : (
              <button onClick={handleRazorpay} disabled={isPaying} className="mt-4 w-full rounded-xl bg-[#16a34a] py-3.5 text-sm font-black text-white disabled:opacity-60">{isPaying ? "Opening…" : `Pay ₹${bill.grandTotal} Online`}</button>
            )}
            <a href={`tel:${SITE.phone}`} className="mt-2 block text-center text-xs font-bold text-[#ea580c]">Or Call {SITE.phoneDisplay}</a>
          </div>
        </div>
      </div>

      {orderPlaced && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff7ed] text-3xl">🎉</div>
            <h2 className="mt-3 text-xl font-black">Order placed!</h2>
            <div className="mt-1 text-xs font-bold bg-[#facc15] inline-block px-2 py-1 rounded-full">#{orderId}</div>
            <div className="mt-2 text-sm text-black/60">Thank you {name || "guest"}! ₹{bill.grandTotal} confirmed.</div>
            {selectedOffer?.freeItemValue && <div className="mt-2 rounded-xl bg-[#f0fdf4] px-3 py-2 text-xs font-bold text-[#16a34a]">🎁 Free item worth ₹{selectedOffer.freeItemValue} included</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`https://wa.me/91${SITE.whatsapp}?text=${waText}`} target="_blank" className="rounded-full bg-[#16a34a] py-2.5 text-sm font-black text-white">WhatsApp</a>
              <button onClick={handleDone} className="rounded-full border py-2.5 text-sm font-bold">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
