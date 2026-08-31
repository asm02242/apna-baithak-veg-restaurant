"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";
import FoodCard from "../components/FoodCard";

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

type Category = {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
};

const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Rating" },
  { id: "name", label: "Name A-Z" },
] as const;

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("popular");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [vegOnly] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        const d = await r.json();
        if (!cancelled && Array.isArray(d.categories)) {
          setCategories(d.categories);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allItems: MenuItem[] = useMemo(() => categories.flatMap((c) => c.items), [categories]);

  const filtered = useMemo(() => {
    let items = activeCat === "all" ? allItems : categories.find((c) => c.id === activeCat)?.items || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          (it.description || "").toLowerCase().includes(q)
      );
    }
    if (filterAvailable) items = items.filter((it) => it.isAvailable !== false);
    if (filterBestseller) items = items.filter((it) => it.bestSeller);
    if (vegOnly) items = items.filter((it) => it.veg !== false);

    const sorted = [...items];
    if (sort === "price-low") sorted.sort((a, b) => (a.price - b.price));
    else if (sort === "price-high") sorted.sort((a, b) => (b.price - a.price));
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    // popular keeps original order (bestSeller first already seeded)
    return sorted;
  }, [allItems, categories, activeCat, search, sort, filterAvailable, filterBestseller, vegOnly]);

  const totalCount = allItems.length;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Title + search + meta */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-[28px] sm:text-[36px] font-black tracking-tight text-[#1c0a00] leading-none">
                  Our Menu — <span className="text-[#ea580c]">Pure Veg</span>
                </h1>
                <p className="mt-2 text-sm text-black/60">
                  {loading ? "Loading fresh items…" : `${filtered.length} of ${totalCount} dishes • Real-time availability • 100% Pure Veg • Freshly prepared`}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/10 border border-[#16a34a]/20 px-3 py-1.5 font-bold text-[#16a34a]">● Pure Veg Only</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-bold ring-1 ring-black/5">{totalCount} dishes</span>
              </div>
            </div>

            {/* Search + controls */}
            <div className="rounded-[20px] bg-white p-3 sm:p-4 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40">⌕</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dishes, chaap, momos, noodles…"
                    className="w-full rounded-full border bg-[#fff7ed] py-3 pl-9 pr-4 text-sm font-medium outline-none ring-[#ea580c]/20 placeholder:text-black/40 focus:bg-white focus:ring-2 border-black/10"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">✕</button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="rounded-full border bg-white px-4 py-3 text-xs font-bold ring-1 ring-black/5 outline-none focus:ring-[#ea580c]/30"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <a href="/combos" className="hidden sm:inline-flex items-center rounded-full bg-[#1c0a00] px-5 py-3 text-xs font-black text-white hover:bg-black transition">View Combos →</a>
                  <a href="/offers" className="inline-flex items-center rounded-full bg-[#ea580c] px-5 py-3 text-xs font-black text-white hover:bg-[#c2410c] transition">Offers</a>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterBestseller((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-black border transition ${filterBestseller ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white text-black/70 border-black/10 hover:bg-[#fff7ed]"}`}
                >
                  ★ Bestsellers
                </button>
                <button
                  onClick={() => setFilterAvailable((v) => !v)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-black border transition ${filterAvailable ? "bg-[#16a34a] text-white border-[#16a34a]" : "bg-white text-black/70 border-black/10 hover:bg-[#fff7ed]"}`}
                >
                  ● Available only
                </button>
                <span className="ml-auto text-xs text-black/50 hidden sm:inline">{filtered.length} results • Sorted by {SORTS.find((s) => s.id === sort)?.label}</span>
              </div>
            </div>

            {/* Category navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-thin -mx-1 px-1">
              <button
                onClick={() => setActiveCat("all")}
                className={`snap-start shrink-0 rounded-full px-4 py-2.5 text-sm font-black border transition ${activeCat === "all" ? "bg-[#1c0a00] text-white border-[#1c0a00] shadow" : "bg-white text-black/70 border-black/10 hover:bg-[#fff7ed]"}`}
              >
                All • {totalCount}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold border transition ${activeCat === c.id ? "bg-[#ea580c] text-white border-[#ea580c] shadow" : "bg-white text-black/70 border-black/10 hover:bg-[#fff7ed]"}`}
                >
                  <span>{c.icon}</span> {c.name} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-black ${activeCat === c.id ? "bg-white text-[#ea580c]" : "bg-[#fff7ed] text-black/60"}`}>{c.items.length}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[20px] bg-white p-3 shadow ring-1 ring-black/5">
                  <div className="h-[118px] rounded-2xl bg-[#fff7ed] shimmer" />
                  <div className="mt-3 h-3 w-20 rounded bg-[#fff7ed] shimmer" />
                  <div className="mt-2 h-4 w-32 rounded bg-[#fff7ed] shimmer" />
                  <div className="mt-3 flex gap-2">
                    <div className="h-10 flex-1 rounded-2xl bg-[#fff7ed] shimmer" />
                    <div className="h-10 flex-1 rounded-2xl bg-[#fff7ed] shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] bg-white p-10 text-center shadow ring-1 ring-black/5">
              <div className="text-4xl">🍽️</div>
              <div className="mt-2 text-lg font-black text-[#1c0a00]">No dishes found</div>
              <p className="mt-1 text-sm text-black/60">Try a different search or category. All items are fetched live from /api/menu.</p>
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => { setSearch(""); setActiveCat("all"); setFilterBestseller(false); setFilterAvailable(false); }} className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-sm font-bold text-white">Clear filters</button>
                <a href="/menu" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold">Reset</a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold text-black/50">{activeCat === "all" ? "All categories" : categories.find((c) => c.id === activeCat)?.name} • {filtered.length} items</div>
                <div className="text-xs text-black/40">Availability from API • Unavailable items cannot be added</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => (
                  <FoodCard key={item.id} item={item as any} />
                ))}
              </div>
            </>
          )}
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
