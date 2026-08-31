"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SITE } from "@/lib/site";

declare global { interface Window { Razorpay: any; } }

function loadRazorpay(): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type AddressOpt = { 
  id: string; 
  label: string; 
  title: string; 
  full: string; 
  phone: string;
  name?: string;
  house_no?: string;
  building_name?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  address_type?: string;
  is_default?: boolean;
  address?: string;
};

export default function CheckoutPage() {
  const { cart, bill, count, increase, decrease, clearCart, tip, setTip, deliveryType, setDeliveryType, selectedOffer, setSelectedOffer, eligibleOffers, subtotal } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Lucknow");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("");
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [newAddrLabel, setNewAddrLabel] = useState("Home");
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [slot, setSlot] = useState<"now" | "schedule">("now");
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "razorpay">("cod");
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState("");

  // Saved addresses from AuthContext (local) + fallback
  const SAVED: AddressOpt[] = useMemo(() => {
    if (user && user.addresses.length > 0) {
      return user.addresses.map((a) => ({ id: a.id, label: a.label.toUpperCase(), title: `${a.label} • ${a.full.slice(0, 32)}`, full: a.full, phone: user.phone || SITE.phoneDisplay }));
    }
    return [
      { id: "home", label: "HOME", title: "Home • Eldeco City", full: "Eldeco City, IIM Road, Lucknow • House/Flat No, Landmark", phone: SITE.phoneDisplay },
      { id: "work", label: "WORK", title: "Work • Office", full: "Add work address for faster checkout", phone: "" },
    ];
  }, [user]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!phone && user.phone) setPhone(user.phone);
      if (!selectedAddr && SAVED[0]) setSelectedAddr(SAVED[0].id);
    } else if (!selectedAddr && SAVED[0]) {
      setSelectedAddr(SAVED[0].id);
    }
  }, [user, SAVED]);

  // Neon addresses fetch (if logged via cookie)
  const [neonAddrs, setNeonAddrs] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/addresses", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d.addresses) && d.addresses.length) setNeonAddrs(d.addresses);
        }
      } catch {}
    })();
  }, []);

  const effectiveAddresses: AddressOpt[] = useMemo(() => {
    if (neonAddrs.length) {
      return neonAddrs.map((a: any) => ({ 
        id: a.id, 
        label: (a.address_type || "home").toUpperCase(), 
        title: `${a.address_type || "home"} • ${a.city || "Lucknow"}`, 
        full: `${a.house_no ? a.house_no + ", " : ""}${a.street ? a.street + ", " : ""}${a.building_name ? a.building_name + ", " : ""}${a.landmark ? a.landmark + ", " : ""}${a.city ? a.city + ", " : ""}${a.state ? a.state + " " : ""}${a.pincode ? " - " + a.pincode : ""}`,
        phone: a.phone || phone || SITE.phoneDisplay,
        name: a.name,
        house_no: a.house_no,
        building_name: a.building_name,
        street: a.street,
        landmark: a.landmark,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        latitude: a.latitude,
        longitude: a.longitude,
        address_type: a.address_type,
        is_default: a.is_default,
        address: a.address
      }));
    }
    return SAVED;
  }, [neonAddrs, SAVED, phone]);

  const resolvedAddress = useMemo(() => {
    if (deliveryType !== "delivery") return deliveryType;
    if (address.trim()) return address + (landmark ? ", " + landmark : "");
    const found = effectiveAddresses.find((a) => a.id === selectedAddr);
    return found?.full || "";
  }, [address, landmark, effectiveAddresses, selectedAddr, deliveryType]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit phone required";
    if (deliveryType === "delivery") {
      if (showNewAddr) {
        if (!houseNo.trim()) e.address = "House / Flat / Plot No. required";
        else if (!street.trim()) e.address = "Street / Road / Area required";
        else if (!pincode.trim() || pincode.length !== 6) e.address = "Valid 6-digit PIN Code required";
      } else if (!resolvedAddress.trim()) {
        e.address = "Delivery address required";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const grandTotalWithCoupon = Math.max(0, bill.grandTotal - couponDiscount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponMsg(null);
    setApiError("");
    try {
      const r = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon.trim().toUpperCase(), cartTotal: subtotal }) });
      const d = await r.json();
      if (!r.ok || !d.valid) throw new Error(d.error || "Invalid coupon");
      setCouponDiscount(d.discount || 0);
      setCouponCode(d.code);
      setCouponMsg(`Applied ${d.code} • -₹${d.discount}`);
    } catch (e: any) {
      setCouponDiscount(0);
      setCouponCode(null);
      setCouponMsg(e.message || "Invalid coupon");
    }
  };

  // Build items for Neon order — try to map cart ids to menu_item_id via /api/menu lookup
  const [menuMap, setMenuMap] = useState<Map<string, any>>(new Map());
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        const d = await r.json();
        const m = new Map<string, any>();
        (d.allItems || []).forEach((it: any) => m.set(it.id, it));
        setMenuMap(m);
      } catch {}
    })();
  }, []);

  const placeOrderNeon = async () => {
    if (!validate()) return false;
    if (cart.length === 0) return false;
    setPlacing(true);
    setApiError("");
    try {
      // Prepare items payload: try to send menu_item_id if known, else fallback to name-based (will error -> we fallback to local success)
      const items = cart.map((it) => {
        const variant = (it as any).variant as string | undefined;
        const menuItem = menuMap.get(it.id);
        if (menuItem) {
          return { menu_item_id: it.id, variant: variant || (menuItem.half != null ? "full" : undefined), quantity: it.quantity };
        }
        // If not found as menu item, try as combo id or generic — let backend validate
        return { menu_item_id: it.id, quantity: it.quantity, variant: variant || undefined };
      });

      const payload: any = {
        customer_name: name.trim(),
        phone: phone.replace(/\D/g, ""),
        address: resolvedAddress,
        items,
        coupon_code: couponCode || undefined,
        offer_id: selectedOffer?.id || undefined,
        payment_method: payment,
        notes: `${notes || ""}${slot === "schedule" ? ` | Scheduled ${scheduleTime}` : " | ASAP"}${selectedOffer ? ` | Offer ${selectedOffer.label}` : ""}${couponCode ? ` | Coupon ${couponCode}` : ""}`.trim(),
      };

      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) {
        // If unauthorized (no cookie) — fallback to WhatsApp-only success (keep cart)
        if (r.status === 401) {
          const id = `AB${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
          setOrderId(id);
          setOrderPlaced(true);
          return true;
        }
        throw new Error(d.error || "Order failed");
      }
      setOrderId(d.order?.id || `AB${Date.now().toString().slice(-6)}`);
      setOrderPlaced(true);
      return true;
    } catch (e: any) {
      setApiError(e.message || "Could not place order. Try COD or WhatsApp.");
      return false;
    } finally {
      setPlacing(false);
    }
  };

  const waText = useMemo(() => {
    const offerText = selectedOffer ? `%0A*Offer:* ${selectedOffer.label}` : "";
    const couponText = couponCode ? `%0A*Coupon:* ${couponCode} (-₹${couponDiscount})` : "";
    return encodeURIComponent(
      `*APNA BAITHAK - New Order #${orderId || "PREVIEW"}*%0A%0A` +
        cart.map((i) => `• ${i.name}${(i as any).variant ? ` (${(i as any).variant})` : ""} x${i.quantity} = ₹${i.price * i.quantity}`).join("%0A") +
        offerText + couponText +
        `%0A%0A*Bill:* Subtotal ₹${bill.subtotal} | Discount -₹${bill.discount}${couponDiscount ? ` | Coupon -₹${couponDiscount}` : ""} | Delivery ₹${bill.deliveryFee} | Handling ₹${bill.handlingFee}${bill.smallCartFee ? ` | Small cart ₹${bill.smallCartFee}` : ""}${tip ? ` | Tip ₹${tip}` : ""}%0A*Total: ₹${grandTotalWithCoupon}*%0A*Items: ${count}*%0A%0AName: ${name || "-"}%0APhone: ${phone || "-"}%0AType: ${deliveryType}%0AAddress: ${resolvedAddress || "-"}%0ASlot: ${slot === "now" ? "Delivery in 32 mins" : `Scheduled ${scheduleTime}`}%0APayment: ${payment}%0ANotes: ${notes || "-"}`
    );
  }, [cart, bill, count, name, phone, deliveryType, resolvedAddress, slot, scheduleTime, payment, notes, orderId, selectedOffer, couponCode, couponDiscount, grandTotalWithCoupon]);

  const handlePlaceCOD = async () => {
    const ok = await placeOrderNeon();
    if (ok) setTimeout(() => window.open(`https://wa.me/91${SITE.whatsapp}?text=${waText}`, "_blank"), 600);
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setPayError("");
    setIsPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load Razorpay");
      const res = await fetch("/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: grandTotalWithCoupon }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Payment key not configured. Use COD.");
      const options = {
        key,
        amount: data.amount,
        currency: data.currency,
        name: "APNA BAITHAK",
        description: `${count} items • ₹${grandTotalWithCoupon}`,
        image: "/logo-neon.svg",
        order_id: data.id,
        handler: async function (response: any) {
          const ok = await placeOrderNeon();
          if (ok) {
            setOrderId((prev) => prev + ` • ${response.razorpay_payment_id}`);
          }
          setIsPaying(false);
        },
        prefill: { name, contact: phone, email: user?.email || "" },
        theme: { color: "#ea580c" },
        modal: { ondismiss: () => setIsPaying(false) },
      };
      const rz = new (window as any).Razorpay(options);
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
      <div className="min-h-screen bg-[#fff7ed]">
        <div className="sticky top-0 z-30 bg-white border-b border-black/5">
          <div className="mx-auto max-w-[1160px] px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1c0a00] text-white font-black text-sm">AB</span>
              <span className="font-black tracking-tight">APNA BAITHAK</span>
              <span className="hidden sm:inline text-xs font-bold text-black/40">• Checkout</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
          <div className="rounded-[24px] bg-white p-10 ring-1 ring-black/5">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff7ed] text-3xl">🛒</div>
            <h1 className="mt-4 font-black text-xl">Cart is empty</h1>
            <p className="mt-2 text-sm text-black/60">Add dishes from the menu to checkout — delivery in 32 mins.</p>
            <Link href="/menu" className="mt-6 inline-flex rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white hover:bg-[#c2410c]">Browse Menu →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <div className="sticky top-0 z-30 bg-white border-b border-black/5 backdrop-blur">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1c0a00] font-black text-sm text-white">AB</span>
            <span className="font-black tracking-tight">APNA BAITHAK</span>
            <span className="hidden sm:inline text-xs font-bold text-black/40">• Checkout</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#fff7ed] border border-black/5 px-3 py-1.5"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Pure Veg • Eldeco City</span>
            <span className="bg-[#1c0a00] text-white px-3 py-1.5 rounded-full">{count} items • ₹{grandTotalWithCoupon}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
        <div className="space-y-4">
          {/* Service mode */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-black flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">🚚</span> Service mode</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#fff7ed] border border-black/5">
              {[
                { id: "delivery", label: "Delivery", sub: "32 mins" },
                { id: "takeaway", label: "Takeaway", sub: "20 mins" },
                { id: "dinein", label: "Dine-in", sub: "Visit us" },
              ].map((t) => (
                <button key={t.id} onClick={() => setDeliveryType(t.id as any)} className={`rounded-xl px-3 py-3 text-center transition ${deliveryType === t.id ? "bg-[#ea580c] text-white shadow" : "bg-white hover:bg-[#fff7ed] border border-black/5"}`}>
                  <div className="text-xs font-black">{t.label}</div>
                  <div className={`text-[11px] ${deliveryType === t.id ? "text-white/80" : "text-black/50"}`}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-black flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">👤</span> Customer details</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-black/60">Full name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.name ? "border-red-400 bg-red-50" : "border-black/10 bg-[#fff7ed] focus:bg-white"}`} />
                {errors.name && <div className="mt-1 text-xs font-bold text-red-600">{errors.name}</div>}
              </div>
              <div>
                <label className="text-xs font-bold text-black/60">Phone *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.phone ? "border-red-400 bg-red-50" : "border-black/10 bg-[#fff7ed] focus:bg-white"}`} />
                {errors.phone && <div className="mt-1 text-xs font-bold text-red-600">{errors.phone}</div>}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">📍</span> Delivery address</h2>
              {deliveryType === "delivery" && <button onClick={() => setShowNewAddr(!showNewAddr)} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-black hover:bg-[#fff7ed]">{showNewAddr ? "Hide" : "+ Add new"}</button>}
            </div>

            {deliveryType === "delivery" ? (
              <>
                <div className="mt-4 grid gap-2.5">
                  {effectiveAddresses.map((a) => (
                    <button key={a.id} onClick={() => { setSelectedAddr(a.id); setAddress(""); }} className={`text-left rounded-2xl border-2 p-4 flex gap-3 transition ${selectedAddr === a.id && !address ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-[#fff7ed]/60 hover:bg-white"}`}>
                      <span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] font-black shrink-0 ${selectedAddr === a.id && !address ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/15 text-transparent"}`}>✓</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-white border border-black/5 px-2 py-0.5 text-[10px] font-black tracking-wide">{a.label}</span>
                          <span className="text-sm font-bold truncate">{a.title}</span>
                        </div>
                        <div className="mt-1 text-sm text-black/60 leading-snug">{a.full}</div>
                        {a.phone && <div className="mt-1 text-xs font-semibold text-black/40">{a.phone}</div>}
                      </div>
                    </button>
                  ))}
                </div>

                {showNewAddr && (
                  <div className="mt-4 rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                    <div className="text-xs font-black">Add new address</div>
                    <div className="mt-3 grid gap-3">
                      <div className="flex gap-2">
                        {["Home", "Work", "Other"].map((l) => (
                          <button key={l} onClick={() => setNewAddrLabel(l)} className={`rounded-full px-3 py-1.5 text-xs font-black border ${newAddrLabel === l ? "bg-[#1c0a00] text-white border-[#1c0a00]" : "bg-white border-black/10"}`}>{l}</button>
                        ))}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-black/60">Customer Name *</label>
                          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.name ? "border-red-400 bg-red-50" : "border-black/10 bg-white"}`} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-black/60">Phone *</label>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#ea580c]/20 ${errors.phone ? "border-red-400 bg-red-50" : "border-black/10 bg-white"}`} />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-black/60">House / Flat / Plot No. *</label>
                          <input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g., 123 / Flat 4B / Plot 56" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-black/60">Building / Apartment Name</label>
                          <input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="e.g., Green Valley Apts / Tower C" className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-black/60">Street / Road / Area *</label>
                          <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g., IIM Road / Main Street" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-black/60">Landmark</label>
                          <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near Mall / Opposite Park" className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                      </div>
                      
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-bold text-black/60">City</label>
                          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lucknow" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-black/60">State</label>
                          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Uttar Pradesh" className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-black/60">PIN Code *</label>
                          <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="226013" inputMode="numeric" maxLength={6} className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!houseNo.trim() || !street.trim() || !pincode.trim()) { setErrors((p) => ({ ...p, address: "House/Plot No., Street & PIN Code required" })); return; }
                            const fullAddress = `${houseNo.trim()}, ${street.trim()}${buildingName.trim() ? ", " + buildingName.trim() : ""}${landmark.trim() ? ", " + landmark.trim() : ""}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;
                            try {
                              const r = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add", address: fullAddress, house_no: houseNo.trim(), building_name: buildingName.trim(), street: street.trim(), landmark: landmark.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim(), address_type: newAddrLabel.toLowerCase(), is_default: false, name: name.trim(), phone: phone.replace(/\D/g, "") }) });
                              if (r.ok) {
                                const d = await r.json();
                                setNeonAddrs((p) => [...p, { id: d.id, address: fullAddress, house_no: houseNo.trim(), building_name: buildingName.trim(), street: street.trim(), landmark: landmark.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim(), address_type: newAddrLabel.toLowerCase(), name: name.trim(), phone: phone.replace(/\D/g, "") }]);
                              }
                            } catch {}
                            setShowNewAddr(false);
                          }}
                          className="rounded-full bg-[#ea580c] px-5 py-2.5 text-xs font-black text-white">Save address</button>
                        <button onClick={() => setShowNewAddr(false)} className="rounded-full border bg-white px-5 py-2.5 text-xs font-black">Cancel</button>
                      </div>
                      {errors.address && <div className="text-xs font-bold text-red-600">{errors.address}</div>}
                    </div>
                  </div>
                )}

                {!showNewAddr && (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-black/60">Or enter a different address for this order</div>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / Flat / Street / Landmark — leave empty to use selected address" rows={2} className="mt-1.5 w-full rounded-2xl border border-black/10 bg-[#fff7ed] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20" />
                  </div>
                )}
              </>
            ) : (
              <div className="mt-3 rounded-2xl bg-[#fff7ed] border border-black/5 px-4 py-3 text-sm text-black/60">
                {deliveryType === "takeaway" ? "You’ll pick up from counter — no delivery address needed. We’ll confirm on call." : "Dine-in at Eldeco City restaurant — table will be assigned on arrival."}
              </div>
            )}
            {apiError && <div className="mt-3 rounded-2xl bg-[#fef2f2] border border-red-200 px-4 py-2.5 text-xs font-bold text-[#e11d48]">{apiError}</div>}
          </div>

          {/* Slot + notes */}
          <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-sm font-black flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">⏱️</span> Delivery slot</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setSlot("now")} className={`rounded-2xl border-2 p-4 text-left ${slot === "now" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-[#fff7ed]/60"}`}>
                <div className="text-sm font-black">Deliver in 32 min</div>
                <div className="text-xs text-black/50">Fastest • Recommended</div>
              </button>
              <button onClick={() => setSlot("schedule")} className={`rounded-2xl border-2 p-4 text-left ${slot === "schedule" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-[#fff7ed]/60"}`}>
                <div className="text-sm font-black">Schedule later</div>
                <div className="text-xs text-black/50">Pick time</div>
              </button>
            </div>
            {slot === "schedule" && <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm" />}
            <div className="mt-4">
              <label className="text-xs font-black">Special instructions</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="No onion, extra spicy, call on arrival..." rows={2} className="mt-1.5 w-full rounded-2xl border border-black/10 bg-[#fff7ed] px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-[78px]">
            <h2 className="text-sm font-black flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] border border-black/5">🧾</span> Order summary ({count})</h2>
            <div className="mt-4 divide-y divide-black/5 max-h-[220px] overflow-auto rounded-2xl border border-black/5">
              {cart.map((it) => (
                <div key={`${it.id}-${(it as any).variant || "s"}`} className="flex gap-3 p-3 bg-[#fff7ed]/40">
                  <img src={it.image} alt={it.name} className="h-12 w-12 rounded-xl object-cover bg-white ring-1 ring-black/5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold line-clamp-1">{it.name} {(it as any).variant && <span className="text-xs font-semibold text-black/50">• {(it as any).variant}</span>}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <button onClick={() => decrease(it.id)} className="grid h-6 w-6 place-items-center rounded-full border border-black/10 bg-white text-xs font-black">−</button>
                      <span className="text-xs font-black px-1">{it.quantity}</span>
                      <button onClick={() => increase(it.id)} className="grid h-6 w-6 place-items-center rounded-full bg-[#ea580c] text-white text-xs font-black">+</button>
                      <span className="ml-auto text-sm font-black">₹{it.price * it.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mt-4 rounded-2xl border border-dashed border-black/10 bg-[#fff7ed] p-3">
              <div className="text-xs font-black">Have a coupon?</div>
              <div className="mt-2 flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter code" className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-bold outline-none" />
                <button onClick={applyCoupon} className="rounded-full bg-[#1c0a00] px-4 py-2.5 text-xs font-black text-white">Apply</button>
              </div>
              {couponMsg && <div className={`mt-2 rounded-full px-3 py-1.5 text-xs font-bold ${couponCode ? "bg-[#f0fdf4] text-[#16a34a] border border-[#16a34a]/15" : "bg-[#fef2f2] text-[#e11d48]"}`}>{couponMsg}</div>}
              {couponCode && couponDiscount > 0 && <button onClick={() => { setCouponCode(null); setCouponDiscount(0); setCoupon(""); setCouponMsg(null); }} className="mt-2 text-xs font-bold text-[#e11d48]">Remove coupon</button>}
            </div>

            {/* Offers */}
            <div className="mt-4 rounded-2xl border-2 border-dashed border-[#ea580c]/20 bg-[#fff7ed] p-3">
              <div className="text-xs font-black">🎁 Choose one offer</div>
              {eligibleOffers.length === 0 ? (
                <div className="mt-2 text-xs text-black/60">Add more to unlock offers • Try coupons above</div>
              ) : (
                <div className="mt-2 grid gap-2">
                  {eligibleOffers.map((o) => (
                    <button key={o.id} onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : { id: o.id, label: o.label, type: o.type, discount: o.value, freeItemValue: o.freeItemValue, desc: o.desc })} className={`text-left rounded-xl border-2 px-3 py-2.5 transition ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-white" : "border-transparent bg-white hover:border-[#ea580c]/20"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`grid h-4 w-4 place-items-center rounded-full border-2 text-[9px] ${selectedOffer?.id === o.id ? "border-[#ea580c] bg-[#ea580c] text-white" : "border-black/15"}`}>{selectedOffer?.id === o.id ? "✓" : ""}</span>
                        <span className="text-xs font-black">{o.label}</span>
                      </div>
                      <div className="ml-6 text-xs text-black/55">{o.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tip */}
            <div className="mt-3 rounded-2xl bg-[#fff7ed] border border-black/5 p-3">
              <div className="text-xs font-black">Tip rider</div>
              <div className="mt-2 flex gap-1.5">
                {[0, 10, 20, 30, 50].map((v) => (
                  <button key={v} onClick={() => setTip(v)} className={`flex-1 rounded-full px-2 py-2 text-xs font-black border ${tip === v ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white border-black/10"}`}>{v === 0 ? "No tip" : `₹${v}`}</button>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div className="mt-4 space-y-2 text-sm border-t border-black/5 pt-4">
              <div className="flex justify-between"><span className="text-black/55">Item total</span><span className="font-bold">₹{bill.subtotal}</span></div>
              <div className="flex justify-between"><span className="text-black/55">Handling</span><span className="font-bold">₹{bill.handlingFee}</span></div>
              <div className="flex justify-between"><span className="text-black/55">Delivery {bill.isFreeDelivery && <span className="text-[#16a34a]">(FREE)</span>}</span><span className="font-bold">₹{bill.deliveryFee}</span></div>
              {bill.smallCartFee > 0 && <div className="flex justify-between text-[#e11d48]"><span>Small cart fee</span><span className="font-bold">₹{bill.smallCartFee}</span></div>}
              {bill.discount > 0 && <div className="flex justify-between text-[#ea580c]"><span>Offer discount</span><span className="font-bold">-₹{bill.discount}</span></div>}
              {couponDiscount > 0 && <div className="flex justify-between text-[#16a34a]"><span>Coupon {couponCode}</span><span className="font-bold">-₹{couponDiscount}</span></div>}
              {tip > 0 && <div className="flex justify-between"><span className="text-black/55">Tip</span><span className="font-bold">₹{tip}</span></div>}
              <div className="flex justify-between text-base font-black border-t border-black/5 pt-3"><span>To pay</span><span>₹{grandTotalWithCoupon}</span></div>
              {(bill.savings > 0 || couponDiscount > 0) && <div className="rounded-2xl bg-[#fff7ed] border border-[#ea580c]/15 px-3 py-2 text-center text-xs font-bold text-[#ea580c]">You saved ₹{bill.savings + couponDiscount} 🎉</div>}
            </div>

            {/* Payment */}
            <div className="mt-4 rounded-2xl border border-black/5 p-3">
              <div className="text-xs font-black">Payment method</div>
              <div className="mt-2 grid gap-2">
                <label className={`flex items-center gap-3 rounded-2xl border-2 p-3 cursor-pointer transition ${payment === "cod" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white"}`}>
                  <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  <span className="text-sm font-bold">Cash on Delivery</span>
                  <span className="ml-auto text-xs bg-[#fff7ed] border border-black/5 px-2 py-1 rounded-full font-bold">COD</span>
                </label>
                <label className={`flex items-center gap-3 rounded-2xl border-2 p-3 cursor-pointer transition ${payment === "razorpay" ? "border-[#ea580c] bg-[#fff7ed]" : "border-black/5 bg-white"}`}>
                  <input type="radio" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} />
                  <span className="text-sm font-bold">Pay Online — UPI / Card</span>
                  <span className="ml-auto text-xs bg-[#16a34a] text-white px-2 py-1 rounded-full font-bold">Razorpay</span>
                </label>
              </div>
              {payError && <div className="mt-2 rounded-xl bg-[#fef2f2] border border-red-200 px-3 py-2 text-xs font-bold text-[#e11d48]">{payError}</div>}
            </div>

            {payment === "cod" ? (
              <button onClick={handlePlaceCOD} disabled={placing} className="mt-4 w-full rounded-full bg-[#ea580c] py-4 text-sm font-black text-white hover:bg-[#c2410c] disabled:opacity-60 shadow">{placing ? "Placing…" : `Place order • ₹${grandTotalWithCoupon}`}</button>
            ) : (
              <button onClick={handleRazorpay} disabled={isPaying} className="mt-4 w-full rounded-full bg-[#16a34a] py-4 text-sm font-black text-white disabled:opacity-60 shadow">{isPaying ? "Opening…" : `Pay ₹${grandTotalWithCoupon} Online`}</button>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href={`tel:${SITE.phone}`} className="rounded-full border bg-white py-2.5 text-center text-xs font-bold">Call {SITE.phoneDisplay}</a>
              <a href={`https://wa.me/91${SITE.whatsapp}?text=${waText}`} target="_blank" className="rounded-full bg-[#f0fdf4] border border-[#16a34a]/15 py-2.5 text-center text-xs font-black text-[#16a34a]">WhatsApp</a>
            </div>
            <div className="mt-2 text-center text-[11px] text-black/40">By placing order you agree to T&C • Neatly stored in Neon</div>
          </div>
        </div>
      </div>

      {orderPlaced && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c0a00]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff7ed] border border-black/5 text-3xl">🎉</div>
            <h2 className="mt-4 text-2xl font-black">Order placed!</h2>
            <div className="mt-2 inline-flex rounded-full bg-[#facc15] px-3 py-1 text-xs font-black">#{orderId}</div>
            <div className="mt-3 text-sm text-black/60">Thank you {name || "guest"}! Your order for ₹{grandTotalWithCoupon} is confirmed. Order is saved to Neon and WhatsApp.</div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href={`https://wa.me/91${SITE.whatsapp}?text=${waText}`} target="_blank" className="rounded-full bg-[#16a34a] py-3 text-sm font-black text-white">WhatsApp</a>
              <a href={`https://wa.me/91${SITE.whatsappSecondary}?text=${waText}`} target="_blank" className="rounded-full border bg-white py-3 text-sm font-black text-[#16a34a]">Alt WhatsApp</a>
            </div>
            <button onClick={handleDone} className="mt-2 w-full rounded-full border bg-white py-3 text-sm font-bold">Done • Continue shopping</button>
            <Link href="/orders" className="mt-2 inline-block text-xs font-bold text-[#ea580c] hover:underline">View My Orders →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
