"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type MenuItem = { id: string; name: string; price: number; category: string; image?: string; isAvailable?: boolean; description?: string };

export default function WishlistPage() {
  const { ids, toggle, count } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "available">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/menu", { cache: "no-store" });
        const d = await r.json();
        if (!cancelled && Array.isArray(d.allItems)) setItems(d.allItems);
      } catch {
        try {
          const { allItems } = await import("@/data/menu");
          if (!cancelled) setItems(allItems as any);
        } catch {}
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const wishlistItems = useMemo(() => {
    let list = items.filter((it) => ids.includes(it.id));
    if (filter === "available") list = list.filter((it) => it.isAvailable !== false);
    return list;
  }, [items, ids, filter]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff7ed]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight text-[#1c0a00]">Wishlist <span className="text-[#ea580c]">♥</span></h1>
              <p className="mt-1 text-sm text-black/60">{loading ? "Loading saved items…" : `${count} saved • Real Neon data via AuthContext & WishlistContext`}{user ? ` • Hi, ${user.name}` : " • Guest mode"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter((v) => v === "all" ? "available" : "all")} className={`rounded-full px-4 py-2 text-xs font-black border ${filter === "available" ? "bg-[#16a34a] text-white border-[#16a34a]" : "bg-white border-black/10"}`}>{filter === "available" ? "● Available" : "Filter: All"}</button>
              <Link href="/menu" className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-xs font-black text-white">Browse Menu →</Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-[24px] bg-white shimmer ring-1 ring-black/5" />)}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="mt-6 rounded-[28px] bg-white p-10 text-center ring-1 ring-black/5 shadow-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] text-3xl">♡</div>
              <h2 className="mt-4 text-xl font-black">Your wishlist is empty</h2>
              <p className="mt-2 text-sm text-black/60">Tap ♥ on any dish to save it. Your wishlist syncs when you login — backed by Neon via AuthContext.</p>
              <div className="mt-6 flex justify-center gap-2">
                <Link href="/menu" className="rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">Explore Menu</Link>
                <Link href="/offers" className="rounded-full border bg-white px-6 py-3 text-sm font-black">View Offers</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlistItems.map((it) => (
                  <div key={it.id} className="group rounded-[24px] bg-white p-3 ring-1 ring-black/5 shadow-sm card-hover overflow-hidden">
                    <div className="relative h-36 overflow-hidden rounded-2xl bg-[#fff7ed]">
                      {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" /> : <div className="grid h-full w-full place-items-center text-3xl">🍽️</div>}
                      <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-black border ${it.isAvailable === false ? "bg-[#fef2f2] text-[#e11d48] border-red-200" : "bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/15"}`}>{it.isAvailable === false ? "Unavailable" : "Available"}</span>
                      <button onClick={() => toggle(it.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white shadow border border-black/5 text-[#ea580c] hover:bg-[#fff7ed]">♥</button>
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-bold text-[#ea580c]">{it.category}</div>
                      <div className="mt-0.5 text-sm font-black leading-tight line-clamp-1 text-[#1c0a00]">{it.name}</div>
                      {it.description && <div className="text-xs text-black/55 line-clamp-1">{it.description}</div>}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-black">₹{it.price}</span>
                        <span className="text-xs text-black/40 line-through">₹{Math.round(it.price * 1.12)}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button disabled={it.isAvailable === false} onClick={() => addToCart({ id: it.id, name: it.name, price: it.price, image: it.image, category: it.category })} className="rounded-full bg-[#ea580c] py-2.5 text-xs font-black text-white hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed">Add to Cart</button>
                        <button onClick={() => toggle(it.id)} className="rounded-full border bg-white py-2.5 text-xs font-black hover:bg-[#fef2f2] hover:text-[#e11d48]">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <Link href="/cart" className="rounded-full bg-[#1c0a00] px-6 py-3 text-sm font-black text-white">Go to Cart</Link>
                <Link href="/menu" className="rounded-full border bg-white px-6 py-3 text-sm font-black">Continue shopping</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
