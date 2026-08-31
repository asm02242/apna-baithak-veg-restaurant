"use client";
import { useEffect, useState } from "react";
import FoodCard from "./FoodCard";
import { bestSellers as staticBest } from "@/data/menu";
import type { MenuItem } from "@/data/menu";

export default function BestSellers() {
  const [items, setItems] = useState<MenuItem[]>(staticBest.slice(0, 9));
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/menu', { cache: 'no-store' });
        const d = await r.json();
        const all: MenuItem[] = d.allItems || d.categories?.flatMap((c: any) => c.items) || [];
        const best = all.filter((it: any) => it.bestSeller || it.is_featured).slice(0, 9);
        if (best.length) setItems(best as any);
      } catch {}
    };
    load();
    const h = () => load();
    window.addEventListener('menu-updated', h as any);
    const id = setInterval(load, 15000);
    return () => { window.removeEventListener('menu-updated', h as any); clearInterval(id); };
  }, []);
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-2">
      <div className="rounded-[24px] bg-white p-4 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-xl sm:text-2xl font-black text-[#1c0a00]">Best Sellers <span className="ml-2 rounded-full bg-[#ea580c] px-2.5 py-1 text-xs font-bold text-white">TOP 9</span></h3>
          <a href="#menu" className="text-sm font-bold text-[#ea580c] hover:underline">View all →</a>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <FoodCard key={it.id} item={it as any} />
          ))}
        </div>
      </div>
    </section>
  );
}
