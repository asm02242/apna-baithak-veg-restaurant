"use client";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useDetail } from "../../context/DetailContext";
import { useWishlist } from "../../context/WishlistContext";
import type { MenuItem } from "@/data/menu";
import { bestSellers as staticBest } from "@/data/menu";

function getImage(item: MenuItem) {
  if (item.image) return `${item.image}?v=${Date.now()}`;
  const n = item.name.toLowerCase();
  if (n.includes("paneer") || n.includes("shahi") || n.includes("rogan josh") || n.includes("kadai")) return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop";
  if (n.includes("chaap")) return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop";
  if (n.includes("noodle") || n.includes("fried rice") || n.includes("schezwan")) return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop";
  if (n.includes("momo")) return "https://images.unsplash.com/photo-1534422298391-e4f640380802?w=400&h=300&fit=crop";
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";
}

export default function BestSellersHome() {
  const { cart, addToCart, increase, decrease } = useCart();
  const { openDetail } = useDetail();
  const { toggle, isWishlisted } = useWishlist();
  const [items, setItems] = useState<MenuItem[]>(staticBest.slice(0, 8));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        const d = await r.json();
        const all: any[] = d.allItems || d.categories?.flatMap((c: any) => c.items) || [];
        const best = all.filter((it: any) => it.bestSeller || it.is_featured || it.isFeatured).slice(0, 8);
        const pool = best.length ? best : all.slice(0, 8);
        if (pool.length && !cancelled) setItems(pool as MenuItem[]);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    const id = setInterval(load, 15000);
    const h = () => load();
    window.addEventListener("menu-updated", h as any);
    return () => { clearInterval(id); window.removeEventListener("menu-updated", h as any); };
  }, []);

  const inCart = (id: string) => cart.find((c) => c.id === id);

  return (
    <section id="menu" className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-2 scroll-mt-20">
      <div className="rounded-[24px] bg-white p-4 sm:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-[#1c0a00]">Best Sellers <span className="ml-2 rounded-full bg-[#ea580c] px-2.5 py-1 text-xs font-black text-white">TOP 8</span></h2>
            <p className="mt-1 text-xs sm:text-sm text-black/60">Most ordered • Fresh • Pure Veg — tap card for details</p>
          </div>
          <a href="/menu" className="rounded-full bg-[#1c0a00] px-4 py-2 text-xs font-black text-white hover:bg-black transition">View Full Menu →</a>
        </div>

        {loading && items.length === 0 ? (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[240px] rounded-[20px] bg-[#fff7ed] shimmer ring-1 ring-black/5" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.slice(0, 8).map((it) => {
              const img = getImage(it as any);
              const isAvailable = (it as any).isAvailable !== false;
              const hasVariant = (it as any).half != null && (it as any).full != null;
              const halfId = `${it.id}-half`;
              const fullId = `${it.id}-full`;
              const halfInCart = inCart(halfId);
              const fullInCart = inCart(fullId);
              const singleInCart = inCart(it.id);
              const wish = isWishlisted(it.id);
              return (
                <div key={it.id} className={`group flex flex-col rounded-[20px] bg-white p-3 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] card-hover ${!isAvailable ? "opacity-70" : ""}`}>
                  <div onClick={() => openDetail(it as any)} className="relative overflow-hidden rounded-2xl cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={it.name} className={`h-[130px] w-full object-cover ${!isAvailable ? "grayscale" : ""}`} loading="lazy" />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(it.id); }}
                      aria-label="Wishlist"
                      className={`absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full shadow border backdrop-blur text-sm ${wish ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white/90 text-black/60 border-white"}`}
                    >
                      {wish ? "♥" : "♡"}
                    </button>
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-extrabold shadow">
                      <span className="h-3 w-3 rounded-[3px] border border-[#16a34a] grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /></span> VEG
                    </span>
                    <span className="absolute right-2 top-2 rounded-full bg-[#1c0a00] px-2 py-1 text-[11px] font-bold text-white">★ {(it.rating ?? 4.5).toFixed(1)}</span>
                    {!isAvailable && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-white">Unavailable</span>}
                  </div>

                  <div onClick={() => openDetail(it as any)} className="flex-1 pt-3 cursor-pointer">
                    <div className="text-[11px] font-bold tracking-[0.08em] text-[#ea580c]">{it.category}</div>
                    <div className="line-clamp-1 text-[15px] font-extrabold leading-tight text-[#1c0a00] group-hover:text-[#ea580c]">{it.name}</div>
                    {hasVariant ? <div className="mt-1 text-xs text-black/60">Half ₹{(it as any).half} • Full ₹{(it as any).full}</div> : <div className="mt-1 text-xs text-black/60">Fresh • Hot • Pure Veg</div>}
                  </div>

                  <div className="mt-3">
                    {!isAvailable ? (
                      <div className="rounded-full bg-gray-100 py-2 text-center text-xs font-black text-black/50 border">Unavailable</div>
                    ) : hasVariant ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-2xl border bg-[#fff7ed] p-1.5">
                          <div className="text-center text-xs font-bold">Half</div>
                          <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{(it as any).half}</div>
                          {!halfInCart ? (
                            <button onClick={() => addToCart({ id: halfId, name: `${it.name} (Half)`, price: (it as any).half, category: it.category, image: img })} className="mt-1 w-full rounded-full bg-white border border-[#ea580c] py-1.5 text-xs font-black text-[#ea580c] hover:bg-[#ea580c] hover:text-white">Add +</button>
                          ) : (
                            <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                              <button onClick={() => decrease(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15">−</button>
                              <span className="text-xs font-bold">{halfInCart.quantity}</span>
                              <button onClick={() => increase(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                            </div>
                          )}
                        </div>
                        <div className="rounded-2xl border bg-white p-1.5">
                          <div className="text-center text-xs font-bold">Full</div>
                          <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{(it as any).full}</div>
                          {!fullInCart ? (
                            <button onClick={() => addToCart({ id: fullId, name: `${it.name} (Full)`, price: (it as any).full, category: it.category, image: img })} className="mt-1 w-full rounded-full bg-[#ea580c] py-1.5 text-xs font-bold text-white hover:bg-[#c2410c]">Add +</button>
                          ) : (
                            <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                              <button onClick={() => decrease(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15">−</button>
                              <span className="text-xs font-bold">{fullInCart.quantity}</span>
                              <button onClick={() => increase(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[18px] font-black text-[#1c0a00]">₹{it.price}</div>
                        {!singleInCart ? (
                          <button onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, category: it.category, image: img })} className="rounded-full bg-[#ea580c] border border-[#ea580c] px-5 py-2 text-xs font-black text-white hover:bg-[#c2410c] shadow">Add +</button>
                        ) : (
                          <div className="flex items-center gap-1 rounded-full bg-[#ea580c] p-1 text-white">
                            <button onClick={() => decrease(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/15">−</button>
                            <span className="min-w-[28px] text-center text-sm font-bold">{singleInCart.quantity}</span>
                            <button onClick={() => increase(it.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
