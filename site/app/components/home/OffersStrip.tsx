"use client";
import { useEffect, useState } from "react";

type Offer = {
  id: string;
  label: string;
  type: string;
  minOrder: number;
  value: number;
  desc: string;
  priority: number;
  active?: boolean;
};

const fallback: Offer[] = [
  { id: "flat75", label: "₹75 OFF", type: "flat", minOrder: 499, value: 75, desc: "₹75 off on orders above ₹499", priority: 1 },
  { id: "flat150", label: "₹150 OFF", type: "flat", minOrder: 999, value: 150, desc: "₹150 off on orders above ₹999", priority: 2 },
  { id: "freeItem200", label: "FREE ITEM ₹200", type: "freeItem", minOrder: 1500, value: 200, desc: "Order ₹1500+ and get any item worth ₹200 free", priority: 3 },
  { id: "freeItem250", label: "FREE ITEM ₹250", type: "freeItem", minOrder: 2000, value: 250, desc: "Order ₹2000+ and get any item worth ₹250 free", priority: 4 },
  { id: "bulkOffer", label: "BULK OFFER", type: "bulk", minOrder: 3000, value: 0, desc: "Special bulk order pricing - contact us for custom quote", priority: 5 },
];

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

export default function OffersStrip() {
  const [offers, setOffers] = useState<Offer[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // try admin offers endpoint (public fallback may not exist) -> silently fallback
        const r = await fetch("/api/admin/offers", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          const arr: Offer[] = Array.isArray(d.offers) ? d.offers : Array.isArray(d) ? d : [];
          const active = arr.filter((o: any) => o.active !== false);
          if (active.length && !cancelled) {
            setOffers(active.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99)));
          }
        }
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div className="rounded-[24px] bg-white p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-black text-[#1c0a00]">Offers & Savings</h3>
            <p className="text-xs sm:text-sm text-black/60">Choose only one offer per order • Auto-applied in cart • Pure Veg</p>
          </div>
          <a href="#menu" className="rounded-full bg-[#1c0a00] px-4 py-2 text-xs font-black text-white hover:bg-black transition">Order now →</a>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin -mx-1 px-1">
          {offers.map((o) => (
            <div
              key={o.id}
              className={`snap-start shrink-0 w-[264px] sm:w-[280px] rounded-[20px] bg-gradient-to-br ${gradients[o.id] ?? "from-[#ea580c] to-[#fb923c]"} p-4 text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg backdrop-blur ring-1 ring-white/20">{icons[o.id] ?? "🎉"}</span>
                  <div>
                    <div className="text-sm font-black leading-none">{o.label}</div>
                    <div className="text-xs opacity-90 mt-0.5">Min ₹{o.minOrder}</div>
                  </div>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#1c0a00]">{o.type === "flat" ? `SAVE ₹${o.value}` : o.type === "freeItem" ? "FREE ITEM" : "CUSTOM"}</span>
              </div>
              <div className="mt-3 text-xs leading-5 opacity-90 line-clamp-2">{o.desc}</div>
              <div className="mt-2 text-[10px] font-semibold opacity-70">*T&C • One offer per order</div>
            </div>
          ))}
        </div>
        {loading && <div className="mt-2 text-[11px] text-black/40">Loading live offers…</div>}
      </div>
    </section>
  );
}
