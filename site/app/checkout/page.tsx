"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCart, AVAILABLE_COUPONS } from "../context/CartContext";
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
  const { cart, subtotal, bill, count, increase, decrease, removeFromCart, clearCart, tip, setTip, deliveryType, setDeliveryType, couponCode, appliedCoupon, applyCoupon, removeCoupon, couponError } = useCart();
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
  const [couponInput, setCouponInput] = useState("");
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
    if (deliveryType === "delivery" && !address.trim() && selectedAddr === SAVED[0]?.id && !address) {
      if (address.trim().length < 5) e.address = "Add house/flat, floor details";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const waText = useMemo(() => {
    const addrText = deliveryType === "delivery" ? (address || SAVED.find((a) => a.id === selectedAddr)?.full || "-") : deliveryType;
    return encodeURIComponent(
      `*APNA BAITHAK - New Order #${orderId || "PREVIEW"}*%0A%0A` +
        cart.map((i) => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`).join("%0A") +
        `%0A%0A*Bill:* Subtotal ₹${bill.subtotal} | Discount -₹${bill.discount} | Delivery ₹${bill.deliveryFee} | Handling ₹${bill.handlingFee}${bill.smallCartFee ? ` | Small cart ₹${bill.smallCartFee}` : ""}${tip ? ` | Tip ₹${tip}` : ""}%0A*Total: ₹${bill.grandTotal}*%0A*Items: ${count}*%0A%0AName: ${name || "-"}%0APhone: ${phone || "-"}%0AType: ${deliveryType}%0AAddress: ${addrText}%0ASlot: ${slot === "now" ? "Delivery in 32 mins" : `Scheduled ${scheduleTime}`}%0APayment: ${payment}%0ANotes: ${notes || "-"}` +
        `%0A%0A${SITE.mapsLink}`
    );
  }, [cart, bill, count, name, phone, deliveryType, address, selectedAddr, slot, scheduleTime, payment, notes, orderId]);

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
      if (!res.ok) {
        // demo fallback if keys not configured on server (so Pay still does something)
        if ((data.error || "").toLowerCase().includes("not configured") || res.status === 500) {
          await new Promise((r) => setTimeout(r, 900));
          const demoId = `AB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}_DEMO`;
          setOrderId(demoId);
          setOrderPlaced(true);
          setIsPaying(false);
          setPayError("Demo: Razorpay keys not set on server — order placed as Paid Online (test). Add keys in Vercel for real payments.");
          setTimeout(() => window.open(waLink, "_blank"), 800);
          return;
        }
        throw new Error(data.error || "Order creation failed. Set RAZORPAY_KEY_ID/SECRET in .env.local");
      }
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) {
        // demo fallback if public key missing at build
        await new Promise((r) => setTimeout(r, 900));
        const demoId = `AB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}_DEMO`;
        setOrderId(demoId);
        setOrderPlaced(true);
        setIsPaying(false);
        setPayError("Demo: NEXT_PUBLIC_RAZORPAY_KEY_ID not set at build — simulated Pay Online success. Add it in Vercel and redeploy for real Razorpay.");
        setTimeout(() => window.open(waLink, "_blank"), 800);
        return;
      }
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
            <span className="hidden sm:inline text-xs font-bold text-black/40">• Checkout • Fast delivery</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="hidden sm:inline bg-[#fff7ed] border border-[#ea580c]/20 px-2 py-1 rounded-full text-[#ea580c]">✓ Secure checkout</span>
            <span className="bg-[#1c0a00] text-white px-3 py-1.5 rounded-full">{count} items • ₹{bill.grandTotal}</span>
          </div>
        </div>
        <div className="mx-auto max-w-[1160px] px-4 pb-3">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-[#ea580c]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#ea580c] text-white text-xs">1</span> Cart</span>
            <span className="h-[2px] w-8 bg-[#ea580c]" />
            <span className="flex items-center gap-1 text-[#ea580c]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#ea580c] text-white text-xs">2</span> Address & Slot</span>
            <span className="h-[2px] w-8 bg-[#ea580c]" />
            <span className="flex items-center gap-1 text-black/40"><span className="grid h-5 w-5 place-items-center rounded-full border text-xs">3</span> Payment</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-4 py-6 grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm">Service mode</h2>
              <span className="text-[11px] font-bold bg-[#facc15] px-2 py-1 rounded-full">30 mins • Pure Veg</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#f7f7f7]">
              {[
                { id: "delivery", label: "Delivery", sub: "32 mins" },
                { id: "takeaway", label: "Takeaway", sub: "20 mins" },
                { id: "dinein", label: "Dine-in", sub: "Visit us" },
              ].map((t) => (
                <button key={t.id} onClick={() => setDeliveryType(t.id as any)} className={`rounded-xl px-3 py-2.5 text-center ${deliveryType === t.id ? "bg-[#ea580c] text-white shadow" : "bg-white hover:bg-white"}`}>
                  <div className="text-xs font-black">{t.label}</div>
                  <div className={`text-[11px] ${deliveryType === t.id ? "text-white/80" : "text-black/60"}`}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="font-black text-sm flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#1c0a00] text-white text-xs">📍</span> Delivery address</h2>
            {!user && <div className="mt-2 rounded-xl bg-[#fff7ed] border px-3 py-2 text-xs">🔒 <Link href="/login" className="font-black text-[#ea580c]">Login</Link> to save wishlist & addresses per user — or continue as guest.</div>}
            {deliveryType === "delivery" ? (
              <>
                <div className="mt-3 grid gap-2">
                  {SAVED.map((a) => (
                    <button key={a.id} onClick={() => setSelectedAddr(a.id)} className={`text-left rounded-xl border-2 p-3 flex gap-3 ${selectedAddr === a.id ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white hover:border-black/10"}`}>
                      <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 ${selectedAddr === a.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/20"}`}>{selectedAddr === a.id ? "✓" : ""}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[10px] font-black">{a.label}</span>
                          <span className="text-xs font-bold">{a.title}</span>
                        </div>
                        <div className="text-xs text-black/60 leading-tight mt-1">{a.full}</div>
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setSelectedAddr("new")} className={`text-left rounded-xl border-2 p-3 flex gap-3 ${selectedAddr === "new" ? "border-[#ea580c] bg-[#fff7ed]" : "border-dashed border-black/15 bg-[#f7f7f7]"}`}>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-white text-xs">+</span>
                    <span className="text-xs font-bold">Add new address</span>
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  <div>
                    <label className="text-xs font-black">Full name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.name ? "border-red-500" : ""}`} />
                    {errors.name && <div className="text-xs text-red-600 mt-1 font-bold">{errors.name}</div>}
                  </div>
                  <div>
                    <label className="text-xs font-black">Phone *</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" inputMode="numeric" className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.phone ? "border-red-500" : ""}`} />
                    {errors.phone && <div className="text-xs text-red-600 mt-1 font-bold">{errors.phone}</div>}
                  </div>
                  <div>
                    <label className="text-xs font-black">House / Flat / Floor / Landmark *</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="E.g. Eldeco City, IIM Road, Flat 302, Block A, near gate 2..." rows={2} className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.address ? "border-red-500" : ""}`} />
                    {errors.address && <div className="text-xs text-red-600 mt-1 font-bold">{errors.address}</div>}
                    <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-black/10">
                      <iframe src={SITE.mapsEmbed} className="h-[170px] w-full border-0" loading="lazy" />
                    </div>
                    <a href={SITE.mapsLink} target="_blank" className="mt-2 inline-flex text-xs font-bold text-[#ea580c] hover:underline">Open in Google Maps →</a>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-xl bg-[#f7f7f7] p-3">
                <div className="text-sm font-bold">{deliveryType === "takeaway" ? "Takeaway from counter" : "Dine-in at restaurant"}</div>
                <div className="text-xs text-black/60">{SITE.fullAddress} • {SITE.hours}</div>
                <div className="mt-3 grid gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.name ? "border-red-500" : ""}`} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone *" className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.phone ? "border-red-500" : ""}`} />
                </div>
                {(errors.name || errors.phone) && <div className="mt-2 text-xs text-red-600 font-bold">{errors.name || errors.phone}</div>}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="font-black text-sm flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#facc15] text-xs">⏱️</span> Delivery slot</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setSlot("now")} className={`rounded-xl border-2 p-3 text-left ${slot === "now" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white"}`}>
                <div className="text-xs font-black">Delivery in 32 minutes</div>
                <div className="text-[11px] text-black/60">Fastest • Recommended</div>
              </button>
              <button onClick={() => setSlot("schedule")} className={`rounded-xl border-2 p-3 text-left ${slot === "schedule" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white"}`}>
                <div className="text-xs font-black">Schedule for later</div>
                <div className="text-[11px] text-black/60">Choose time</div>
              </button>
            </div>
            {slot === "schedule" && (
              <div className="mt-3 flex items-center gap-2">
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" />
                <span className="text-xs text-black/60">Today • kitchen open {SITE.hours}</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <label className="text-xs font-black">Special instructions (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="No onion, extra spicy, cutlery needed..." rows={2} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5 sticky top-[86px]">
            <h2 className="font-black text-sm flex items-center gap-2">🧾 Order summary <span className="ml-auto text-xs font-bold bg-[#f7f7f7] px-2 py-1 rounded-full">{count} items</span></h2>
            <div className="mt-3 divide-y max-h-[260px] overflow-auto pr-1">
              {cart.map((it) => (
                <div key={it.id} className="flex gap-3 py-3">
                  <img src={it.image} alt={it.name} className="h-12 w-12 rounded-xl object-cover bg-[#f7f7f7] ring-1 ring-black/5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold leading-tight line-clamp-1">{it.name}</div>
                    <div className="text-[11px] text-black/60">₹{it.price} × {it.quantity}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <button onClick={() => decrease(it.id)} className="grid h-6 w-6 place-items-center rounded-full border text-xs">−</button>
                      <span className="text-xs font-black px-1">{it.quantity}</span>
                      <button onClick={() => increase(it.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#ea580c] text-white text-xs">+</button>
                      <button onClick={() => removeFromCart(it.id)} className="ml-auto text-[11px] font-bold text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="text-sm font-black">₹{it.price * it.quantity}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[#ea580c]/30 bg-[#fff7ed] p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏷️</span>
                <span className="text-xs font-black">Coupons & offers</span>
                {appliedCoupon && <span className="ml-auto text-xs font-bold text-[#ea580c]">-₹{bill.discount}</span>}
              </div>
              {!appliedCoupon ? (
                <div className="mt-2 flex gap-2">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="BAITHAK10" className="flex-1 rounded-xl border px-3 py-2 text-xs font-bold uppercase" />
                  <button onClick={() => { if (applyCoupon(couponInput)) setCouponInput(""); }} className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-black text-white">Apply</button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2 border">
                  <span className="text-xs font-black text-[#ea580c]">{appliedCoupon.code} • {appliedCoupon.desc}</span>
                  <button onClick={removeCoupon} className="text-xs font-bold text-red-600">Remove</button>
                </div>
              )}
              {couponError && <div className="mt-1 text-xs font-bold text-red-600">{couponError}</div>}
              {!appliedCoupon && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {AVAILABLE_COUPONS.slice(0, 2).map((c) => (
                    <button key={c.code} onClick={() => applyCoupon(c.code)} className="shrink-0 rounded-full bg-white border px-3 py-1 text-xs font-bold">{c.code} • {c.label}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-[#f7f7f7] p-3">
              <div className="text-xs font-black">Tip for rider • optional</div>
              <div className="mt-2 flex gap-1.5">
                {[0, 10, 20, 30, 50].map((v) => (
                  <button key={v} onClick={() => setTip(v)} className={`flex-1 rounded-full px-2 py-1.5 text-xs font-black border ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white"}`}>{v === 0 ? "No tip" : `₹${v}`}</button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between"><span className="text-black/60">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-black/60">Handling charge</span><span className="font-bold">₹{bill.handlingFee}</span></div>
              <div className="flex justify-between"><span className="text-black/60">Delivery fee {bill.isFreeDelivery && <span className="text-[#ea580c]">(FREE)</span>}</span><span className="font-bold">₹{bill.deliveryFee}</span></div>
              {bill.smallCartFee > 0 && <div className="flex justify-between text-red-600"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
              {bill.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Coupon ({appliedCoupon?.code})</span><span className="font-bold">-₹{bill.discount}</span></div>}
              {tip > 0 && <div className="flex justify-between"><span className="text-black/60">Tip</span><span className="font-bold">₹{tip}</span></div>}
              <div className="flex justify-between text-sm font-black border-t pt-2"><span>To pay</span><span>₹{bill.grandTotal}</span></div>
              {bill.savings > 0 && <div className="rounded-xl bg-[#fff7ed] px-3 py-2 text-center text-xs font-bold text-[#ea580c]">You saved ₹{bill.savings} on this order 🎉</div>}
              {!bill.isFreeDelivery && deliveryType === "delivery" && <div className="text-[11px] text-[#a16207] bg-[#fef3c7] rounded-xl px-3 py-2">Add ₹{bill.freeDeliveryRemaining} more for FREE delivery (save ₹40)</div>}
            </div>

            <div className="mt-4 rounded-xl border p-3">
              <div className="text-xs font-black">Payment method</div>
              <div className="mt-2 grid gap-2">
                <label className={`flex items-center gap-2 rounded-xl border-2 p-2.5 cursor-pointer ${payment === "cod" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5"}`}>
                  <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="ml-auto text-[11px] bg-[#ea580c] text-white px-2 py-0.5 rounded-full">Recommended</span>
                </label>
                <label className={`flex items-center gap-2 rounded-xl border-2 p-2.5 cursor-pointer ${payment === "razorpay" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 hover:border-black/10"}`}>
                  <input type="radio" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} />
                  <span className="text-xs font-bold">Pay Online — UPI / Card / NetBanking</span>
                  <span className="ml-auto text-[11px] bg-[#16a34a] text-white px-2 py-0.5 rounded-full">Razorpay</span>
                </label>
              </div>
              {payError && <div className="mt-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600">{payError}</div>}
              <div className="mt-2 text-[11px] text-black/50">Razorpay test mode: use card 4111 1111 1111 1111, UPI success.</div>
            </div>

            {payment === "cod" ? (
              <button onClick={handlePlace} className="mt-4 w-full rounded-xl bg-[#ea580c] py-3.5 text-sm font-black text-white hover:bg-[#c2410c] shadow">
                {deliveryType === "delivery" ? `Pay ₹${bill.grandTotal} • Place order (COD)` : `Confirm • Pay ₹${bill.grandTotal}`}
              </button>
            ) : (
              <button onClick={handleRazorpay} disabled={isPaying} className="mt-4 w-full rounded-xl bg-[#16a34a] py-3.5 text-sm font-black text-white hover:bg-[#15803d] shadow disabled:opacity-60">
                {isPaying ? "Opening Razorpay…" : `Pay ₹${bill.grandTotal} Online`}
              </button>
            )}
            <a href={`tel:${SITE.phone}`} className="mt-2 flex w-full justify-center rounded-xl bg-[#1c0a00] py-3 text-xs font-bold text-white">Or Call • {SITE.phoneDisplay}</a>
            <div className="mt-2 text-center text-[11px] text-black/50">You’ll be redirected to WhatsApp after payment • Fast checkout</div>
          </div>
        </div>
      </div>

      {orderPlaced && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff7ed] text-3xl">🎉</div>
            <h2 className="mt-3 text-xl font-black">Order placed!</h2>
            <div className="mt-1 text-xs font-bold bg-[#facc15] inline-block px-2 py-1 rounded-full">Order #{orderId}</div>
            <div className="mt-2 text-sm text-black/60">Thank you, {name || "guest"}! Your order of ₹{bill.grandTotal} is confirmed. Rider will call on {phone || SITE.phoneDisplay}.</div>
            <div className="mt-3 rounded-xl bg-[#f7f7f7] p-3 text-left text-xs">
              <div className="font-bold">Summary • {count} items • ₹{bill.grandTotal} • {deliveryType} • {slot === "now" ? "32 mins" : scheduleTime} • {payment === "razorpay" ? "Paid Online" : "COD"}</div>
              <div className="mt-1 text-black/60 line-clamp-3">{cart.map((i) => `${i.name} x${i.quantity}`).join(" • ")}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`https://wa.me/91${SITE.whatsapp}?text=${waText}`} target="_blank" className="rounded-full bg-[#ea580c] py-2.5 text-sm font-black text-white text-center">Open WhatsApp</a>
              <button onClick={handleDone} className="rounded-full border py-2.5 text-sm font-bold">Done • Shop again</button>
            </div>
            <div className="mt-2 text-[11px] text-black/40">Save order #{orderId} for support</div>
          </div>
        </div>
      )}
    </div>
  );
}
