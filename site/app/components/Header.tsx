"use client";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { SITE } from "@/lib/site";

export default function Header() {
  const { count, bill, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = "text-sm font-medium text-[#1c0a00] hover:text-[#ea580c] transition";
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 ${
        scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.06)] bg-white/90" : "bg-[#fff7ed]/70"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl overflow-hidden bg-black ring-1 ring-[#f59e0b]/40 shadow-[0_0_12px_rgba(245,158,11,0.35)] grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-neon.svg" alt="AB" className="h-full w-full object-cover" onError={(e) => ((e.currentTarget.style.display = "none"), ((e.currentTarget.nextElementSibling as HTMLElement).style.display = "grid"))} />
              <span className="hidden h-full w-full place-items-center bg-[#ea580c] text-white font-black text-[18px]">AB</span>
            </div>
            <div>
              <div className="font-display text-[18px] font-extrabold leading-none tracking-tight text-[#1c0a00]">APNA BAITHAK</div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-[#ea580c]">PURE VEG • ELDECO CITY</div>
            </div>
            <span className="hidden sm:inline-flex ml-2 items-center gap-1 rounded-full border border-[#16a34a]/20 bg-[#16a34a]/10 px-2 py-1 text-[11px] font-bold text-[#16a34a]">● PURE VEG</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className={linkCls}>Home</a>
            <a href="#menu" className={linkCls}>Order</a>
            <a href="/menu" className="text-sm font-bold text-[#ea580c] hover:underline">Print Menu</a>
            <a href="#about" className={linkCls}>About</a>
            <a href="#gallery" className={linkCls}>Gallery</a>
            <a href="#contact" className={linkCls}>Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <a href={`tel:${SITE.phone}`} className="rounded-full bg-[#1c0a00] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition">Call: {SITE.phoneDisplay}</a>
              <a href={`tel:${SITE.phoneSecondary}`} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-[#1c0a00] hover:bg-[#fff7ed] transition">{SITE.phoneDisplaySecondary}</a>
            </div>
            <a href="#menu" className="relative hidden sm:grid h-10 w-10 place-items-center rounded-xl bg-white border shadow text-sm hover:bg-[#fff7ed]">
              <span className={wishCount > 0 ? "text-[#ea580c]" : "text-black/60"}>{wishCount > 0 ? "♥" : "♡"}</span>
              {mounted && wishCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[#ea580c] text-[10px] font-black text-white">{wishCount}</span>}
            </a>
            {mounted && !user ? (
              <>
                <a href="/login" className="hidden sm:inline-flex rounded-full border bg-white px-4 py-2 text-xs font-black hover:bg-[#fff7ed]">Login</a>
                <a href="/signup" className="hidden sm:inline-flex rounded-full bg-[#ea580c] px-4 py-2 text-xs font-black text-white hover:bg-[#c2410c]">Sign Up</a>
              </>
            ) : mounted && user ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border px-2 py-1 shadow">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ea580c] text-white text-xs font-black">{user.name[0]?.toUpperCase()}</span>
                <span className="text-xs font-bold max-w-[90px] truncate">{user.name}</span>
                <button onClick={logout} className="rounded-full bg-black text-white px-3 py-1 text-xs font-bold">Logout</button>
              </div>
            ) : null}
            {/* Blinkit-style cart */}
            <button
              onClick={openCart}
              className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black shadow transition ${
                mounted && count > 0 ? "bg-[#ea580c] text-white hover:bg-[#c2410c]" : "bg-[#ea580c] text-white hover:bg-[#c2410c]"
              }`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[#ea580c] text-sm">🛒</span>
              <span className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-black">{mounted && count > 0 ? `${count} items` : "Cart"}</span>
                <span className="text-[11px] font-bold opacity-90">{mounted && count > 0 ? `₹${bill.grandTotal}` : "Empty"}</span>
              </span>
              <span className="sm:hidden">{mounted && count > 0 ? `₹${bill.grandTotal}` : "Cart"}</span>
              {mounted && count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#facc15] text-[11px] font-extrabold text-black ring-2 ring-white">{count}</span>}
            </button>
            <button onClick={() => setOpen((v) => !v)} className="md:hidden grid h-10 w-10 place-items-center rounded-xl border bg-white">☰</button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t pt-4">
            <a onClick={() => setOpen(false)} href="#home" className={linkCls}>Home</a>
            <a onClick={() => setOpen(false)} href="#menu" className={linkCls}>Order</a>
            <a onClick={() => setOpen(false)} href="/menu" className="text-sm font-bold text-[#ea580c]">Print Menu</a>
            <a onClick={() => setOpen(false)} href="#about" className={linkCls}>About</a>
            <a onClick={() => setOpen(false)} href="#gallery" className={linkCls}>Gallery</a>
            <a onClick={() => setOpen(false)} href="#contact" className={linkCls}>Contact</a>
            {mounted && !user ? (
              <div className="flex gap-2 pt-2 border-t">
                <a onClick={() => setOpen(false)} href="/login" className="flex-1 rounded-full border bg-white py-2 text-center text-xs font-black">Login</a>
                <a onClick={() => setOpen(false)} href="/signup" className="flex-1 rounded-full bg-[#ea580c] py-2 text-center text-xs font-black text-white">Sign Up</a>
              </div>
            ) : mounted && user ? (
              <div className="rounded-xl bg-[#fff7ed] p-3 flex items-center justify-between">
                <span className="text-xs font-bold">Hi, {user.name} • {user.wishlist.length} wishlist • {user.addresses.length} addresses</span>
                <button onClick={() => { logout(); setOpen(false); }} className="rounded-full bg-black text-white px-3 py-1 text-xs font-bold">Logout</button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
