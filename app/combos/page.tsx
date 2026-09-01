"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";
import { useCart } from "../context/CartContext";
import { useDetail } from "../context/DetailContext";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  half?: number;
  full?: number;
  rating: number;
  bestSeller?: boolean;
  veg: boolean;
  image?: string;
  description?: string;
  isAvailable?: boolean;
};

const FALLBACK: (MenuItem & { badge?: string; highlight?: string })[] = [
  { id: "combos-mini-combo", name: "Mini Combo", category: "Combos", categoryId: "combos", price: 149, half: 89, full: 149, rating: 4.5, veg: true, image: "/images/foods/mini-combo.jpg", description: "1 Main Dish + 2 Roti + Rice + Salad", badge: "Solo • Light", highlight: "Perfect for one", isAvailable: true },
  { id: "combos-family-combo", name: "Family Combo", category: "Combos", categoryId: "combos", price: 399, half: 229, full: 399, rating: 4.7, veg: true, bestSeller: true, image: "/images/foods/family-combo.jpg", description: "2 Main Dishes + 4 Roti + Rice + Dal + Salad + Raita", badge: "Bestseller • 2-3 pax", highlight: "Most ordered", isAvailable: true },
  { id: "combos-party-combo", name: "Party Combo", category: "Combos", categoryId: "combos", price: 599, half: 329, full: 599, rating: 4.8, veg: true, image: "/images/foods/party-combo.jpg", description: "3 Main Dishes + 6 Roti + 2 Rice + Dal + 2 Salad + Raita + Sweet", badge: "Party • 4-6 pax", highlight: "Feast mode", isAvailable: true },
  { id: "thali-special-thali", name: "Baithak Combo", category: "Thali", categoryId: "thali", price: 299, half: 179, full: 299, rating: 4.8, veg: true, bestSeller: true, image: "/images/foods/special-thali.jpg", description: "Paneer/Mushroom + Daal Fry/Makhni + 2 Butter Roti + Laccha + Salad + Raita + Rasgulla", badge: "Thali Special", highlight: "Baithak signature", isAvailable: true },
];

function getImage(it: MenuItem) {
  if (it.image) return `${it.image}?v=${Date.now()}`;
  const n = it.name.toLowerCase();
  if (n.includes("mini")) return `/images/foods/mini-combo.jpg?v=${Date.now()}`;
  if (n.includes("family")) return `/images/foods/family-combo.jpg?v=${Date.now()}`;
  if (n.includes("party")) return `/images/foods/party-combo.jpg?v=${Date.now()}`;
  if (n.includes("baithak") || n.includes("special thali")) return `/images/foods/special-thali.jpg?v=${Date.now()}`;
  if (n.includes("thali")) return `/images/foods/thali.jpg?v=${Date.now()}`;
  return `/images/foods/family-combo.jpg?v=${Date.now()}`;
}

export default function CombosPage() {
  const { cart, addToCart, increase, decrease } = useCart();
  const { openDetail } = useDetail();
  const [combos, setCombos] = useState<(MenuItem & { badge?: string; highlight?: string })[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        const d = await r.json();
        const cats: any[] = d.categories || [];
        const comboCat = cats.find((c) => c.id === "combos");
        const thaliCat = cats.find((c) => c.id === "thali");
        const items: (MenuItem & { badge?: string; highlight?: string })[] = [];
if (comboCat?.items?.length) {
        for (const it of comboCat.items) {
          const name = (it.name as string) || "";
          let badge = "Combo";
          let highlight = "Combo deal";
          if (/mini/i.test(name)) { badge = "Solo • Light"; highlight = "Perfect for one"; }
          else if (/family/i.test(name)) { badge = "Bestseller • 2-3 pax"; highlight = "Most ordered"; }
          else if (/party/i.test(name)) { badge = "Party • 4-6 pax"; highlight = "Feast mode"; }
          items.push({ 
            ...it, 
            badge, 
            highlight,
            half: it.half ?? (it.price ? it.price / 2 : undefined),
            full: it.full ?? it.price,
          });
        }
      }
// Baithak Combo = Special Thali or any thali "special"
      const special = thaliCat?.items?.find((x: any) => /special/i.test(x.name)) || cats.flatMap((c: any) => c.items).find((x: any) => /special.*thali|baithak/i.test(x.name));
      if (special) {
        items.push({ 
          ...special, 
          id: special.id, 
          name: /Baithak|Special/i.test(special.name) ? special.name : "Baithak Combo", 
          badge: "Thali Special", 
          highlight: "Baithak signature",
          half: special.half ?? (special.price ? special.price / 2 : undefined),
          full: special.full ?? special.price,
        });
      }
        // Ensure unique and 4 cards
        const uniq = Array.from(new Map(items.map((x) => [x.id, x])).values());
        let final = uniq.length ? uniq.slice(0, 4) : FALLBACK;
        if (final.length < 4) {
          const missing = FALLBACK.filter((f) => !final.find((x) => x.id === f.id));
          final = [...final, ...missing].slice(0, 4);
        }
        if (!cancelled && final.length) setCombos(final);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const inCart = (id: string) => cart.find((c) => c.id === id);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="rounded-[28px] bg-gradient-to-br from-[#1c0a00] via-[#7c2d12] to-[#ea580c] p-6 sm:p-8 text-white overflow-hidden relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#facc15]/20 blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20">🍱 Combos • Real data from /api/menu • Pure Veg</div>
              <h1 className="mt-3 font-display text-[26px] sm:text-[38px] font-black leading-tight">Combos for Every Gathering</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Mini for solo cravings, Family for 2–3, Party for 4–6, and our Baithak Special Thali combo. Add in one tap — live pricing & availability from the menu.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white px-3 py-1.5 text-[#1c0a00]">● Pure Veg</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">Freshly prepared</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20">Eldeco City • Home Delivery</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a href="/menu?category=combos" className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow ring-1 ring-black/5 hover:bg-[#fff7ed]">View in full menu →</a>
            <span className="text-xs text-black/50">{loading ? "Loading live combos…" : `${combos.length} combos • Tap View Details for ingredients`}</span>
            <a href="/offers" className="ml-auto rounded-full bg-[#ea580c] px-4 py-2 text-sm font-black text-white hover:bg-[#c2410c]">See offers</a>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-[24px] bg-white p-3 shadow ring-1 ring-black/5">
                  <div className="h-[168px] rounded-2xl bg-[#fff7ed] shimmer" />
                  <div className="mt-3 h-4 w-32 rounded bg-[#fff7ed] shimmer" />
                  <div className="mt-2 h-3 w-full rounded bg-[#fff7ed] shimmer" />
                </div>
              ))}
            </div>
          ) : combos.length === 0 ? (
            <div className="rounded-[24px] bg-white p-10 text-center shadow ring-1 ring-black/5">
              <div className="text-4xl">🍱</div>
              <div className="mt-2 font-black">No combos found</div>
              <p className="text-sm text-black/60">Combos are driven by the <code>combos</code> category in /api/menu. Add items there to appear here.</p>
              <a href="/menu" className="mt-4 inline-flex rounded-full bg-[#1c0a00] px-5 py-2 text-sm font-bold text-white">Go to Menu</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {combos.map((it) => {
                const entry = inCart(it.id);
                const img = it.image || "/images/foods/family-combo.jpg";
                const isAvailable = it.isAvailable !== false;
                const active = !!entry;
                return (
                  <div key={it.id} className={`group flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 transition ${active ? "ring-[#ea580c] ring-2" : "ring-black/[0.04]"} ${!isAvailable ? "opacity-70" : "card-hover"}`}>
                    <button onClick={() => openDetail(it as any)} className="relative h-[170px] overflow-hidden bg-[#fff7ed] text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={it.name} className={`h-full w-full object-cover group-hover:scale-[1.04] transition duration-500 ${!isAvailable ? "grayscale" : ""}`} loading="lazy" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black shadow">
                        <span className="h-3 w-3 rounded-[3px] border border-[#16a34a] grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /></span> PURE VEG
                      </span>
                      <span className="absolute right-3 top-3 rounded-full bg-[#ea580c] px-2.5 py-1 text-[11px] font-black text-white shadow">{(it as any).badge}</span>
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#1c0a00] px-2.5 py-1 text-xs font-bold text-white">★ {it.rating.toFixed(1)} {it.bestSeller ? "• Bestseller" : ""}</span>
                      {!isAvailable && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-white">Unavailable</span>}
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow">{(it as any).highlight}</span>
                    </button>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="text-[11px] font-bold tracking-[0.08em] text-[#ea580c]">{it.category.toUpperCase()}</div>
                      <div className="mt-1 text-[16px] font-black leading-tight text-[#1c0a00]">{it.name}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-black/60">{it.description}</div>
                      <div className="mt-3 flex items-center justify-between">
                        {it.half && it.full && it.half !== it.full ? (
                          <div className="flex items-center gap-2">
                            <div className="rounded-2xl border bg-[#fff7ed] p-1.5">
                              <div className="text-center text-xs font-bold">Half</div>
                              <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{it.half}</div>
                            </div>
                            <div className="rounded-2xl border bg-white p-1.5">
                              <div className="text-center text-xs font-bold">Full</div>
                              <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{it.full}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[20px] font-black text-[#1c0a00]">₹{it.price}</div>
                        )}
                        {active && <span className="rounded-full bg-[#16a34a]/10 border border-[#16a34a]/20 px-2 py-1 text-[11px] font-black text-[#16a34a]">In cart • {entry?.quantity}</span>}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => openDetail(it as any)} className="rounded-full border bg-white px-3 py-2.5 text-xs font-bold hover:bg-[#fff7ed] ring-1 ring-black/5">View details</button>
                        {!isAvailable ? (
                          <div className="rounded-full bg-gray-100 py-2.5 text-center text-xs font-black text-black/40 border">Unavailable</div>
                        ) : !entry ? (
                          <button onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, category: it.category, image: img })} className="rounded-full bg-[#ea580c] py-2.5 text-xs font-black text-white hover:bg-[#c2410c] shadow">Add +</button>
                        ) : (
                          <div className="flex items-center justify-between rounded-full bg-[#ea580c] p-1 text-white">
                            <button onClick={() => decrease(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/20">−</button>
                            <span className="text-sm font-bold">{entry.quantity}</span>
                            <button onClick={() => increase(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-[20px] bg-white p-4 shadow ring-1 ring-black/5 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-sm font-bold text-[#1c0a00]">Need bulk or custom combos? <span className="font-normal text-black/60">Contact us for party & office orders.</span></div>
            <a href="/contact" className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-sm font-black text-white hover:bg-black">Contact for bulk →</a>
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
