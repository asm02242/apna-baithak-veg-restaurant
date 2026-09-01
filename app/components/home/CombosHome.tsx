"use client";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import type { MenuItem } from "@/data/menu";

const fallbackCombos: (MenuItem & { badge?: string })[] = [
  { id: "combos-mini-combo", name: "Mini Combo", category: "Combos", categoryId: "combos", price: 149, half: 89, full: 149, rating: 4.5, veg: true, image: "/images/foods/mini-combo.jpg", description: "1 Main Dish + 2 Roti + Rice + Salad", badge: "Solo", isAvailable: true },
  { id: "combos-family-combo", name: "Family Combo", category: "Combos", categoryId: "combos", price: 399, half: 229, full: 399, rating: 4.7, veg: true, bestSeller: true, image: "/images/foods/family-combo.jpg", description: "2 Main Dishes + 4 Roti + Rice + Dal + Salad + Raita", badge: "Bestseller", isAvailable: true },
  { id: "combos-party-combo", name: "Party Combo", category: "Combos", categoryId: "combos", price: 599, half: 329, full: 599, rating: 4.8, veg: true, image: "/images/foods/party-combo.jpg", description: "3 Main Dishes + 6 Roti + 2 Rice + Dal + 2 Salad + Raita + Sweet", badge: "Party", isAvailable: true },
  { id: "thali-special-thali", name: "Baithak Special Thali", category: "Thali", categoryId: "thali", price: 299, half: 179, full: 299, rating: 4.8, veg: true, bestSeller: true, image: "/images/foods/special-thali.jpg", description: "Paneer/Mushroom + Daal Fry/Makhni + 2 Butter Roti + Laccha Paratha + Salad + Raita + Rasgulla", badge: "Thali Special", isAvailable: true },
];

function getImage(it: MenuItem) {
  if (it.image) return `${it.image}?v=${Date.now()}`;
  // Use category-specific combo images, not gallery images
  if (it.category === "Combos" || it.categoryId === "combos") {
    const n = it.name.toLowerCase();
    if (n.includes("mini")) return `/images/foods/mini-combo.jpg?v=${Date.now()}`;
    if (n.includes("family")) return `/images/foods/family-combo.jpg?v=${Date.now()}`;
    if (n.includes("party")) return `/images/foods/party-combo.jpg?v=${Date.now()}`;
    return `/images/foods/family-combo.jpg?v=${Date.now()}`;
  }
  if (it.category === "Thali" || it.categoryId === "thali") {
    return `/images/foods/special-thali.jpg?v=${Date.now()}`;
  }
  return `/images/foods/family-combo.jpg?v=${Date.now()}`;
}

export default function CombosHome() {
  const { cart, addToCart, increase, decrease } = useCart();
  const [combos, setCombos] = useState<(MenuItem & { badge?: string })[]>(fallbackCombos);

  const fetchCombos = async () => {
    try {
      const r = await fetch("/api/menu", { cache: "no-store" });
      const d = await r.json();
      const cats: any[] = d.categories || [];
      const comboCat = cats.find((c) => c.id === "combos");
      const thaliCat = cats.find((c) => c.id === "thali");
      const items: (MenuItem & { badge?: string })[] = [];
      if (comboCat?.items?.length) {
        for (const it of comboCat.items) {
          const name = it.name as string;
          let badge = "Combo";
          if (/mini/i.test(name)) badge = "Solo";
          else if (/family/i.test(name)) badge = "Bestseller";
          else if (/party/i.test(name)) badge = "Party";
          items.push({ 
            ...it, 
            badge,
            half: it.half ?? it.price / 2,
            full: it.full ?? it.price,
          });
        }
      }
      // Add Baithak Combo: use Special Thali as 4th card if available, else fallback
      const special = thaliCat?.items?.find((x: any) => /special/i.test(x.name)) || cats.flatMap((c) => c.items).find((x: any) => /special.*thali/i.test(x.name));
      if (special) {
        items.push({ 
          ...special, 
          badge: "Thali Special", 
          name: special.name.includes("Thali") ? special.name : "Baithak Special Thali",
          half: special.half ?? special.price / 2,
          full: special.full ?? special.price,
        });
      }
      // Ensure 4 cards; pad with fallback if needed, slice to 4
      let final = items.length >= 4 ? items.slice(0, 4) : [...items, ...fallbackCombos.filter((f) => !items.find((x) => x.id === f.id))].slice(0, 4);
      if (final.length === 0) final = fallbackCombos;
      setCombos(final.slice(0, 4));
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchCombos();
    };
    load();
    const id = setInterval(load, 15000);
    const h = () => load();
    window.addEventListener("menu-updated", h as any);
    return () => { cancelled = true; clearInterval(id); window.removeEventListener("menu-updated", h as any); };
  }, []);

  const inCart = (id: string) => cart.find((c) => c.id === id);

  return (
    <section id="combos" className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] sm:text-[28px] font-black tracking-tight text-[#1c0a00]">Combos for Every Occasion</h2>
          <p className="mt-1 text-sm text-black/60">Mini • Family • Party • Baithak Special — add in one tap</p>
        </div>
        <a href="/menu?category=combos" className="hidden sm:inline-flex rounded-full border bg-white px-4 py-2 text-sm font-bold hover:bg-[#fff7ed]">View all combos →</a>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {combos.map((it) => {
          const entry = inCart(it.id);
          const img = getImage(it);
          const isAvailable = it.isAvailable !== false;
          return (
            <div key={it.id} className={`flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] card-hover ${!isAvailable ? 'opacity-70' : ''}`}>
              <div className="relative h-[156px] overflow-hidden bg-[#fff7ed]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={it.name} className={`h-full w-full object-cover ${!isAvailable ? 'grayscale' : ''}`} loading="lazy" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black shadow">
                  <span className="h-3 w-3 rounded-[3px] border border-[#16a34a] grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /></span> PURE VEG
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-[#ea580c] px-2.5 py-1 text-[11px] font-black text-white shadow">{(it as any).badge || "Combo"}</span>
                <span className="absolute bottom-3 left-3 rounded-full bg-[#1c0a00] px-2.5 py-1 text-xs font-bold text-white">★ {it.rating.toFixed(1)}</span>
                {!isAvailable && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-white">Unavailable</span>}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="text-[11px] font-bold tracking-[0.08em] text-[#ea580c]">{it.category.toUpperCase()}</div>
                <div className="mt-1 text-[16px] font-black leading-tight text-[#1c0a00] line-clamp-1">{it.name}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-black/60">{it.description || "Fresh • Hot • Pure Veg"}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
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
                  {!isAvailable ? (
                    <div className="rounded-full bg-gray-100 py-2 text-center text-xs font-black text-black/50 border">Unavailable</div>
                  ) : !entry ? (
                    <button
                      onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, category: it.category, image: img })}
                      className="rounded-full bg-[#ea580c] px-5 py-2.5 text-xs font-black text-white shadow hover:bg-[#c2410c] transition"
                    >
                      Add +
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-[#ea580c] p-1 text-white">
                      <button onClick={() => decrease(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/15 text-sm">−</button>
                      <span className="min-w-[28px] text-center text-sm font-bold">{entry.quantity}</span>
                      <button onClick={() => increase(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#ea580c] text-sm">+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
