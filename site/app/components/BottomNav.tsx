"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const CATS = [
  { id: "all", label: "All", icon: "▦" },
  { id: "thali", label: "Thali", icon: "🍽️" },
  { id: "chinese", label: "Chinese", icon: "🍜" },
  { id: "roasted-chaap", label: "Chaap", icon: "🍢" },
  { id: "momos", label: "Momos", icon: "🥟" },
  { id: "burgers", label: "Snacks", icon: "🍔" },
  { id: "beverages", label: "Drinks", icon: "🥤" },
];

export default function BottomNav() {
  const { count, bill, openCart, isCartOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = () => {
    const el = document.getElementById("menu-search") as HTMLInputElement | null;
    if (el) {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => el.focus(), 300);
      return;
    }
    router.push("/menu");
  };
  const handleCategories = () => {
    if (pathname === "/menu") {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      setCatOpen(true);
    } else {
      router.push("/menu");
      setTimeout(() => setCatOpen(true), 300);
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Free delivery strip — above nav */}
      {mounted && count > 0 && !isCartOpen && (
        <div className="lg:hidden fixed bottom-[64px] inset-x-0 z-40 px-3">
          <div className="mx-auto max-w-[640px] rounded-2xl bg-[#1c0a00] text-white px-3.5 py-3 flex items-center justify-between shadow-[0_8px_28px_rgba(0,0,0,0.28)] border border-white/10">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ea580c] text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-13z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.6" fill="white" stroke="none"/><circle cx="18" cy="20" r="1.6" fill="white" stroke="none"/></svg>
              </span>
              <div className="leading-tight">
                <div className="text-[13px] font-black">{count} {count === 1 ? "item" : "items"} • ₹{bill.grandTotal}</div>
                <div className="text-[11px] opacity-70 font-semibold">{bill.isFreeDelivery ? "FREE delivery unlocked" : `Add ₹${bill.freeDeliveryRemaining} for FREE delivery`}</div>
              </div>
            </div>
            <button onClick={openCart} className="rounded-full bg-[#ea580c] px-4 py-2 text-[13px] font-black text-white active:scale-95 transition">View Cart →</button>
          </div>
        </div>
      )}

      {/* Categories sheet */}
      {catOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div onClick={() => setCatOpen(false)} className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <div className="absolute bottom-[64px] inset-x-0 mx-auto max-w-[640px] rounded-t-[24px] bg-white p-4 shadow-2xl border border-black/5 max-h-[56vh] overflow-auto">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black">Browse categories</div>
              <button onClick={() => setCatOpen(false)} className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-bold border">Close ✕</button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {CATS.map((c) => (
                <Link key={c.id} href={c.id === "all" ? "/menu" : `/menu#${c.id}`} onClick={() => setCatOpen(false)} className="rounded-2xl bg-[#fff7ed] border border-black/5 p-3 text-center hover:bg-white transition">
                  <div className="text-xl">{c.icon}</div>
                  <div className="mt-1 text-xs font-bold">{c.label}</div>
                </Link>
              ))}
            </div>
            <Link href="/menu" onClick={() => setCatOpen(false)} className="mt-3 flex items-center justify-center rounded-full bg-[#1c0a00] py-3 text-sm font-black text-white">Go to full menu →</Link>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-black/5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-[640px] grid grid-cols-5 px-1 py-1.5">
          <Link href="/" className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${isActive("/") ? "bg-[#fff7ed] text-[#ea580c]" : "text-black/60 hover:bg-black/[0.04]"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive("/") ? 2 : 1.6}><path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
            <span className={`text-[10px] font-black tracking-wide ${isActive("/") ? "text-[#ea580c]" : ""}`}>Home</span>
          </Link>
          <button onClick={handleCategories} className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-black/60 hover:bg-black/[0.04] transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            <span className="text-[10px] font-bold">Categories</span>
          </button>
          <button onClick={handleSearch} className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-black/60 hover:bg-black/[0.04] transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20L16.5 16.5"/></svg>
            <span className="text-[10px] font-bold">Search</span>
          </button>
          <button onClick={openCart} className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${count > 0 ? "text-[#ea580c] bg-[#fff7ed]" : "text-black/60 hover:bg-black/[0.04]"}`}>
            <span className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 6h15l-1.5 9h-13z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
              {mounted && count > 0 && <span className="absolute -right-3 -top-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-[#ea580c] px-1 text-[10px] font-black text-white ring-2 ring-white">{count}</span>}
            </span>
            <span className="text-[10px] font-bold">Cart</span>
            {mounted && count > 0 && <span className="text-[9px] font-black leading-none -mt-0.5">₹{bill.grandTotal}</span>}
          </button>
          <Link href="/wishlist" className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${isActive("/wishlist") ? "text-[#ea580c] bg-[#fff7ed]" : "text-black/60 hover:bg-black/[0.04]"}`}>
            <span className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill={mounted && wishCount > 0 ? "#ea580c" : "none"} stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-6.7-4.2-9-9A5 5 0 0 1 8.5 4 4.8 4.8 0 0 1 12 6.2 4.8 4.8 0 0 1 15.5 4 5 5 0 0 1 21 12c-2.3 4.8-9 9-9 9Z"/></svg>
              {mounted && wishCount > 0 && <span className="absolute -right-3 -top-2 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#ea580c] px-1 text-[9px] font-black text-white ring-2 ring-white">{wishCount}</span>}
            </span>
            <span className="text-[10px] font-bold">Wishlist</span>
          </Link>
        </div>
      </nav>
      <div className="lg:hidden h-[64px]" aria-hidden />
    </>
  );
}
