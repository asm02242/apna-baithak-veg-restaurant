"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";
import { useCart } from "../context/CartContext";
import { SITE } from "@/lib/site";

type Offer = {
  id: string;
  label: string;
  type: "flat" | "freeItem" | "bulk" | string;
  minOrder: number;
  value: number;
  freeItemValue?: number;
  desc: string;
  priority: number;
  active?: boolean;
};

type Coupon = {
  code: string;
  title: string;
  description?: string;
  discountType?: string;
  discount_type?: string;
  discountValue?: number;
  discount_value?: number;
  minimumOrder?: number;
  minimum_order?: number;
  maximumDiscount?: number;
  maximum_discount?: number;
  expiryDate?: string;
  expiry_date?: string;
  isActive?: boolean;
  is_active?: boolean;
};

const gradients: Record<string, string> = {
  flat75: "from-[#ea580c] to-[#f97316]",
  flat150: "from-[#1c0a00] to-[#7c2d12]",
  freeItem200: "from-[#16a34a] to-[#15803d]",
  freeItem250: "from-[#7c3aed] to-[#5b21b6]",
  bulkOffer: "from-[#0ea5e9] to-[#0369a1]",
};
const icons: Record<string, string> = {
  flat75: "🎉",
  flat150: "💥",
  freeItem200: "🎁",
  freeItem250: "🏆",
  bulkOffer: "📦",
};

export default function OffersPage() {
  const { bill } = useCart();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) Offers: try public /api/offers, fallback to /api/admin/offers (requires auth, may 401), else empty
        let offerList: Offer[] = [];
        try {
          const r = await fetch("/api/offers", { cache: "no-store" });
          if (r.ok) {
            const d = await r.json();
            const arr = Array.isArray(d.offers) ? d.offers : Array.isArray(d) ? d : [];
            offerList = arr.filter((o: any) => o.active !== false);
          }
        } catch {}
        if (offerList.length === 0) {
          try {
            const r2 = await fetch("/api/admin/offers", { cache: "no-store" });
            if (r2.ok) {
              const d2 = await r2.json();
              const arr2 = Array.isArray(d2.offers) ? d2.offers : [];
              offerList = arr2.filter((o: any) => o.active !== false);
            }
          } catch {}
        }
        if (!cancelled && offerList.length) {
          offerList = offerList.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
          setOffers(offerList);
        }

        // 2) Coupons: fetch /api/coupons public listing; if not found, keep empty (no fake)
        try {
          const cr = await fetch("/api/coupons", { cache: "no-store" });
          if (cr.ok) {
            const cd = await cr.json();
            const arr: Coupon[] = Array.isArray(cd.coupons) ? cd.coupons : Array.isArray(cd) ? cd : [];
            const now = new Date();
            const active = arr.filter((c: any) => {
              const isActive = (c.isActive ?? c.is_active) !== false;
              const exp = c.expiryDate || c.expiry_date;
              if (!isActive) return false;
              if (exp && new Date(exp) < now) return false;
              return true;
            });
            if (!cancelled) setCoupons(active);
          }
        } catch {}
      } finally {
        if (!cancelled) {
          setLoading(false);
          setNote("Showing only active offers • No fake permanent discounts • Fetched live from API");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const activeOffers = offers;
  const hasData = activeOffers.length > 0 || coupons.length > 0;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
            <h1 className="font-display text-[26px] sm:text-[32px] font-black tracking-tight text-[#1c0a00]">Offers, Discounts & Coupons</h1>
            <p className="mt-1 text-sm text-black/60">Only active, real offers are shown here — fetched from <code className="rounded bg-[#fff7ed] px-1 py-0.5 text-xs ring-1 ring-black/5">/api/offers</code> & <code className="rounded bg-[#fff7ed] px-1 py-0.5 text-xs ring-1 ring-black/5">/api/coupons</code>. No fake “permanent” discounts.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-[#fff7ed] px-3 py-1.5 ring-1 ring-[#fed7aa]">Cart: ₹{bill.subtotal} • Free delivery at ₹399</span>
              <span className="rounded-full bg-[#1c0a00] px-3 py-1.5 text-white">One offer per order</span>
              <a href="/menu" className="rounded-full bg-[#ea580c] px-3 py-1.5 text-white">Order now →</a>
            </div>
            {loading && <div className="mt-3 text-xs text-black/40">Loading live offers & coupons…</div>}
            {!loading && !hasData && (
              <div className="mt-4 rounded-2xl bg-[#fff7ed] p-4 ring-1 ring-[#fed7aa]">
                <div className="text-sm font-black text-[#1c0a00]">No active offers right now</div>
                <p className="text-xs text-black/60 mt-1">Active offers will appear here as soon as they are created in Admin → Offers. No placeholder discounts are shown.</p>
                <div className="mt-3 flex gap-2">
                  <a href="/menu" className="rounded-full bg-[#1c0a00] px-4 py-2 text-xs font-bold text-white">Browse menu</a>
                  <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="rounded-full border bg-white px-4 py-2 text-xs font-bold">Ask on WhatsApp</a>
                </div>
              </div>
            )}
            {note && hasData && <div className="mt-3 text-[11px] font-semibold text-[#16a34a]">● {note}</div>}
          </div>
        </section>

        {activeOffers.length > 0 && (
          <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-6">
            <h2 className="text-sm font-black tracking-[0.08em] text-[#1c0a00]">ACTIVE OFFERS</h2>
            <p className="text-xs text-black/60">Auto-applied by cart — eligibility depends on order value</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeOffers.map((o) => {
                const eligible = bill.subtotal >= o.minOrder;
                return (
                  <div key={o.id} className={`rounded-[20px] p-[1px] bg-gradient-to-br ${gradients[o.id] ?? "from-[#ea580c] to-[#fb923c]"} shadow-[0_10px_24px_rgba(0,0,0,0.12)]`}>
                    <div className={`rounded-[19px] bg-gradient-to-br ${gradients[o.id] ?? "from-[#ea580c] to-[#fb923c]"} p-4 text-white relative overflow-hidden`}>
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
                      <div className="flex items-start justify-between gap-3 relative">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg ring-1 ring-white/20">{icons[o.id] ?? "🎉"}</span>
                          <div>
                            <div className="text-sm font-black leading-none">{o.label}</div>
                            <div className="text-xs opacity-90 mt-0.5">Min order ₹{o.minOrder}</div>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${eligible ? "bg-white text-[#1c0a00]" : "bg-black/20 text-white ring-1 ring-white/30"}`}>{eligible ? "Eligible ✓" : `Add ₹${Math.max(0, o.minOrder - bill.subtotal)}`}</span>
                      </div>
                      <div className="mt-3 text-xs leading-5 opacity-95 line-clamp-2">{o.desc}</div>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <span className="rounded-full bg-white/20 px-2 py-1 ring-1 ring-white/20 capitalize">{o.type === "flat" ? `Save ₹${o.value}` : o.type === "freeItem" ? `Free item ₹${o.freeItemValue ?? o.value}` : o.type}</span>
                        {o.type === "flat" && <span className="opacity-80">Priority {o.priority}</span>}
                      </div>
                      <div className="mt-2 text-[10px] font-semibold opacity-70">*T&C • One offer per order • Real expiry enforced on checkout</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {coupons.length > 0 && (
          <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-6">
            <h2 className="text-sm font-black tracking-[0.08em] text-[#1c0a00]">COUPON CODES</h2>
            <p className="text-xs text-black/60">Enter at checkout • Only active, non-expired coupons</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => {
                const code = (c as any).code;
                const title = c.title || code;
                const dtype = (c.discountType || (c as any).discount_type || "flat") as string;
                const dval = c.discountValue ?? (c as any).discount_value ?? 0;
                const minO = c.minimumOrder ?? (c as any).minimum_order ?? 0;
                const maxD = c.maximumDiscount ?? (c as any).maximum_discount;
                const exp = c.expiryDate || (c as any).expiry_date;
                const desc = c.description || "";
                const valLabel = dtype === "percent" ? `${dval}% off` + (maxD ? ` (max ₹${maxD})` : "") : `₹${dval} off`;
                return (
                  <div key={code} className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-2">
                          <span className="rounded-lg bg-[#1c0a00] px-2.5 py-1 text-xs font-mono font-black tracking-widest text-white">{code}</span>
                          <span className="rounded-full bg-[#fff7ed] px-2 py-1 text-[11px] font-bold ring-1 ring-[#fed7aa]">{valLabel}</span>
                        </div>
                        <div className="mt-2 text-sm font-black text-[#1c0a00]">{title}</div>
                        {desc && <div className="text-xs text-black/60 line-clamp-2">{desc}</div>}
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      {minO > 0 && <div className="flex justify-between"><span className="text-black/50">Minimum order</span><span className="font-bold">₹{minO}</span></div>}
                      {exp && <div className="flex justify-between"><span className="text-black/50">Expiry</span><span className="font-bold">{new Date(exp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>}
                      <div className="flex justify-between"><span className="text-black/50">Type</span><span className="font-bold capitalize">{dtype}</span></div>
                    </div>
                    <button
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(code); alert(`Copied ${code}`); } catch { prompt("Copy code:", code); }
                      }}
                      className="mt-3 w-full rounded-full border bg-white py-2 text-xs font-black hover:bg-[#fff7ed]"
                    >
                      Copy code
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          <div className="rounded-[20px] bg-[#1c0a00] p-5 text-white">
            <div className="text-sm font-black">How offers work</div>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-white/80 list-disc pl-4">
              <li>All offers & coupons are validated against live data — expired or inactive ones are hidden.</li>
              <li>Only one offer/coupon per order; the best eligible offer can be selected in cart.</li>
              <li>Free-item offers reserve an item worth up to the stated value — shown at checkout.</li>
              <li>Questions? Call <a href={`tel:${SITE.phone}`} className="underline font-bold">{SITE.phoneDisplay}</a> or <a href={`tel:${SITE.phoneSecondary}`} className="underline font-bold">{SITE.phoneDisplaySecondary}</a> • WhatsApp <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="underline font-bold">Chat</a>.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
      <FoodDetailPanel />
      <FloatingButtons />
      <BottomNav />
    </>
  );
}
