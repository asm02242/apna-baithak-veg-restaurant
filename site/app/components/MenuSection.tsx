"use client";
import { useEffect, useMemo, useState } from "react";
import { menuCategories as staticCategories, allItems as staticItems } from "@/data/menu";
import type { MenuCategory, MenuItem } from "@/data/menu";
import FoodCard from "./FoodCard";

export default function MenuSection() {
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [categories, setCategories] = useState<MenuCategory[]>(staticCategories);
  const [allItems, setAllItems] = useState<MenuItem[]>(staticItems);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menu", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d.categories) && d.categories.length) {
          setCategories(d.categories);
          if (Array.isArray(d.allItems) && d.allItems.length) setAllItems(d.allItems);
          else setAllItems(d.categories.flatMap((c: MenuCategory) => c.items));
        }
      })
      .catch(() => {});
    const onUpdate = () => {
      fetch("/api/menu", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.categories) && d.categories.length) {
            setCategories(d.categories);
            setAllItems(d.allItems ?? d.categories.flatMap((c: MenuCategory) => c.items));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("menu-updated", onUpdate as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener("menu-updated", onUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      if (detail) setActive(detail);
    };
    window.addEventListener("select-category", h as EventListener);
    return () => window.removeEventListener("select-category", h as EventListener);
  }, []);

  const filtered = useMemo(() => {
    let items = active === "all" ? allItems : allItems.filter((i) => i.categoryId === active);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
    }
    return items;
  }, [active, q]);

  return (
    <section id="menu" className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-[#1c0a00]">Full Menu</h2>
          <p className="mt-1 text-sm text-black/60">Search • Filter by category • Add to cart • prices editable in <code className="rounded bg-black/5 px-1.5 py-0.5">data/menu.ts</code></p>
        </div>
        <div className="relative w-full sm:w-[360px]">
          <input
            id="menu-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            placeholder="Search menu — e.g. chaap, momos, noodles"
            className="w-full rounded-full border bg-white px-5 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/40">⌕</span>
          {focused && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 p-3 z-20">
              <div className="text-[11px] font-black tracking-wide text-black/40 mb-2">🔥 Trending searches</div>
              <div className="flex flex-wrap gap-1.5">
                {["Malai Chaap", "Schezwan Noodles", "Tandoori Momos", "Paneer Butter Masala", "Cold Coffee"].map((t) => (
                  <button
                    key={t}
                    onMouseDown={() => setQ(t)}
                    className="rounded-full bg-[#fff7ed] border px-3 py-1.5 text-xs font-bold hover:bg-[#ea580c] hover:text-white hover:border-[#ea580c] transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
              {q && (
                <div className="mt-3 border-t pt-2">
                  <div className="text-[11px] font-bold text-black/60">Suggestions for “{q}”</div>
                  <div className="mt-1 space-y-1">
                    {allItems
                      .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
                      .slice(0, 4)
                      .map((i) => (
                        <button key={i.id} onMouseDown={() => setQ(i.name)} className="w-full text-left rounded-xl px-3 py-2 text-xs hover:bg-[#fff7ed] flex items-center justify-between">
                          <span>🍽️ {i.name}</span>
                          <span className="text-[#ea580c] font-black">₹{i.price}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button onClick={() => setActive("all")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold border ${active === "all" ? "bg-[#1c0a00] text-white border-[#1c0a00]" : "bg-white hover:bg-[#fff7ed]"}`}>All • {allItems.length}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold border ${active === c.id ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white hover:bg-[#fff7ed]"}`}>
            {c.icon} {c.name} • {c.items.length}
          </button>
        ))}
      </div>

      <div className="mt-2 text-xs text-black/50">{filtered.length} items {q && `for “${q}”`} {active !== "all" && `in ${categories.find((c) => c.id === active)?.name}`}</div>

      {filtered.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-[20px] bg-white p-10 text-sm text-black/60">No items found. Try a different search.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((it) => (
            <FoodCard key={it.id} item={it} />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-[#1c0a00] p-4 text-center text-sm text-white">
        Prices shown are from your menu card. Edit easily in <span className="font-mono text-[#fed7aa]">data/menu.ts</span> — Half / Full where applicable.
      </div>
    </section>
  );
}
