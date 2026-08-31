"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { SITE } from "@/lib/site";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Combos", href: "/combos" },
  { label: "Offers", href: "/offers" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { count, bill, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all ${
        scrolled ? "bg-white/95 shadow-[0_4px_24px_rgba(28,10,0,0.06)] border-black/5" : "bg-[#fff7ed]/80 border-black/5"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[64px] lg:h-[72px] items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-11 w-11 rounded-2xl overflow-hidden bg-[#1c0a00] ring-1 ring-black/10 shadow grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-neon.svg"
                alt="Apna Baithak"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = "grid";
                }}
              />
              <span className="hidden h-full w-full place-items-center bg-[#ea580c] text-white font-black">AB</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-[16px] lg:text-[18px] font-extrabold tracking-tight text-[#1c0a00]">APNA BAITHAK</div>
              <div className="text-[10px] lg:text-[11px] font-semibold tracking-[0.14em] text-[#ea580c]">PURE VEG • ELDECO CITY</div>
            </div>
            <span className="hidden xl:inline-flex ml-1 items-center rounded-full border border-[#16a34a]/15 bg-[#16a34a]/10 px-2.5 py-1 text-[10px] font-black tracking-wide text-[#16a34a]">
              ● PURE VEG
            </span>
          </Link>

          {/* Desktop nav - hidden on mobile/tablet, visible lg+ to avoid overcrowding */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-black/5 shadow-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                  active(n.href) ? "bg-[#1c0a00] text-white shadow" : "text-[#1c0a00]/70 hover:bg-[#fff7ed] hover:text-[#1c0a00]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Phones — hide on small, keep if SITE data exists */}
            {SITE.phone && (
              <div className="hidden xl:flex items-center gap-2">
                <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#1c0a00] px-3.5 py-2 text-xs font-bold text-white hover:bg-black transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A18 18 0 0 1 3.1 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7l.4 2.6a2 2 0 0 1-.6 1.7l-1.5 1.5a14 14 0 0 0 6 6l1.5-1.5a2 2 0 0 1 1.7-.6l2.6.4A2 2 0 0 1 22 16.9Z"/></svg>
                  {SITE.phoneDisplay}
                </a>
              </div>
            )}

            {/* Wishlist — desktop */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={`relative hidden sm:grid h-10 w-10 place-items-center rounded-2xl border bg-white text-[#1c0a00] shadow-sm hover:bg-[#fff7ed] transition ${active("/wishlist") ? "ring-2 ring-[#ea580c]/20 border-[#ea580c]/20" : "border-black/5"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={mounted && wishCount > 0 ? "#ea580c" : "none"} stroke={mounted && wishCount > 0 ? "#ea580c" : "currentColor"} strokeWidth="1.7"><path d="M12 21s-6.7-4.2-9-9A5 5 0 0 1 8.5 4 4.8 4.8 0 0 1 12 6.2 4.8 4.8 0 0 1 15.5 4 5 5 0 0 1 21 12c-2.3 4.8-9 9-9 9Z"/></svg>
              {mounted && wishCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-[#ea580c] px-1 text-[10px] font-black text-white ring-2 ring-white">{wishCount}</span>}
            </Link>

            {/* Account — desktop */}
            {mounted && !user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link href="/login" className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold hover:bg-[#fff7ed] transition">Login</Link>
                <Link href="/signup" className="rounded-full bg-[#ea580c] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#c2410c] transition">Sign Up</Link>
              </div>
            ) : mounted && user ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white p-1 pl-1.5 ring-1 ring-black/5 shadow-sm">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ea580c] text-white text-xs font-black">{user.name[0]?.toUpperCase()}</span>
                <Link href="/account" className="max-w-[110px] truncate pr-1 text-xs font-bold hover:text-[#ea580c]">{user.name}</Link>
                <button onClick={logout} className="rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-bold text-white hover:bg-black">Logout</button>
              </div>
            ) : null}

            {/* Account icon — mobile fallback when collapsed */}
            <Link href={mounted && user ? "/account" : "/login"} className="grid sm:hidden h-10 w-10 place-items-center rounded-2xl border bg-white shadow-sm border-black/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center gap-2.5 rounded-2xl bg-[#ea580c] px-3.5 sm:px-4 py-2.5 text-sm font-black text-white shadow hover:bg-[#c2410c] transition active:scale-[0.98]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-[#ea580c]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-13z"/><path d="M6 6L5 2H2"/><circle cx="9" cy="20" r="1.8" fill="#ea580c" stroke="none"/><circle cx="18" cy="20" r="1.8" fill="#ea580c" stroke="none"/></svg>
              </span>
              <span className="hidden sm:flex flex-col items-start leading-none text-left">
                <span className="text-[11px] font-black leading-none">{mounted && count > 0 ? `${count} items` : "Cart"}</span>
                <span className="text-[11px] font-bold opacity-90 leading-none mt-0.5">₹{mounted ? bill.grandTotal : 0}</span>
              </span>
              <span className="sm:hidden text-xs">{mounted && count > 0 ? `₹${bill.grandTotal}` : "Cart"}</span>
              {mounted && count > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#facc15] text-[11px] font-extrabold text-[#1c0a00] ring-2 ring-white">{count}</span>}
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" className="lg:hidden grid h-10 w-10 place-items-center rounded-2xl border bg-white shadow-sm border-black/5">
              <span className={`block h-0.5 w-4 bg-black transition ${mobileOpen ? "rotate-45 translate-y-1" : ""}`} />
              <span className={`block h-0.5 w-4 bg-black -mt-1.5 transition ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-black -mt-1.5 transition ${mobileOpen ? "-rotate-45 -translate-y-1" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown — not overcrowded, grouped */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-black/5 bg-white/80 backdrop-blur py-4">
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold border transition ${active(n.href) ? "bg-[#1c0a00] text-white border-[#1c0a00]" : "bg-[#fff7ed] border-black/5 text-[#1c0a00] hover:bg-white"}`}
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full border bg-white py-2.5 text-center text-xs font-black">
                Wishlist {mounted && wishCount > 0 ? `• ${wishCount}` : ""}
              </Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-[#ea580c] py-2.5 text-center text-xs font-black text-white">
                View Cart • ₹{mounted ? bill.grandTotal : 0}
              </Link>
            </div>
            {SITE.phone && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${SITE.phone}`} className="rounded-full bg-[#1c0a00] py-2.5 text-center text-xs font-bold text-white">{SITE.phoneDisplay}</a>
                <a href={`tel:${SITE.phoneSecondary}`} className="rounded-full border bg-white py-2.5 text-center text-xs font-bold">{SITE.phoneDisplaySecondary}</a>
              </div>
            )}
            {mounted && !user ? (
              <div className="mt-3 flex gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full border bg-white py-2.5 text-center text-xs font-black">Login</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-[#ea580c] py-2.5 text-center text-xs font-black text-white">Sign Up</Link>
              </div>
            ) : mounted && user ? (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#fff7ed] px-4 py-3 ring-1 ring-black/5">
                <div className="text-xs">
                  <div className="font-black">Hi, {user.name}</div>
                  <div className="text-black/60 font-semibold">{user.phone || user.email} • {user.addresses.length} addresses</div>
                </div>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">Logout</button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
