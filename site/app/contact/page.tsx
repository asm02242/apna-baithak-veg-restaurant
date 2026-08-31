"use client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <h1 className="font-display text-[28px] sm:text-[34px] font-black tracking-tight text-[#1c0a00]">Contact — Apna Baithak</h1>
          <p className="mt-1 text-sm text-black/60">Eldeco City, Lucknow • Pure Veg • {SITE.hours} • All days • Home delivery • Tiffin • Bulk orders</p>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
            {/* Info cards */}
            <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] space-y-4">
              <h2 className="font-display text-xl font-black text-[#1c0a00]">Visit • Call • Message</h2>

              <div className="flex gap-3 rounded-2xl bg-[#fff7ed] p-4 ring-1 ring-[#fed7aa]">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ea580c] text-white shrink-0">📍</div>
                <div>
                  <div className="text-sm font-extrabold text-[#1c0a00]">Address</div>
                  <div className="text-sm text-black/70">{SITE.fullAddress}</div>
                  <div className="text-xs text-black/50">{SITE.address}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={SITE.mapsLink} target="_blank" className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-[#fff7ed]">Get Directions →</a>
                    <a href={SITE.mapsLink} target="_blank" className="inline-flex rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-bold text-white">Open in Google Maps</a>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 rounded-2xl bg-[#1c0a00] p-4 text-white hover:bg-black transition">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1c0a00] shrink-0">📞</span>
                  <span><div className="text-xs font-bold opacity-80">Call Primary</div><div className="text-sm font-black">{SITE.phoneDisplay}</div><div className="text-[11px] opacity-70">Tap to call</div></span>
                </a>
                <a href={`tel:${SITE.phoneSecondary}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10 hover:bg-[#fff7ed] transition">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] shrink-0">📞</span>
                  <span><div className="text-xs font-bold text-black/60">Call Alternate</div><div className="text-sm font-black text-[#1c0a00]">{SITE.phoneDisplaySecondary}</div><div className="text-[11px] text-black/50">Tap to call</div></span>
                </a>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <a href={`https://wa.me/91${SITE.whatsapp}?text=Hi%20Apna%20Baithak%2C%20I%20want%20to%20order`} target="_blank" className="flex items-center gap-3 rounded-2xl bg-[#16a34a] p-4 text-white hover:bg-[#15803d] transition">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#16a34a] shrink-0">💬</span>
                  <span><div className="text-xs font-bold opacity-90">WhatsApp</div><div className="text-sm font-bold">Chat to order</div><div className="text-[11px] opacity-80">Quick response</div></span>
                </a>
                <a href={`https://wa.me/91${SITE.whatsappSecondary}?text=Hi%20Apna%20Baithak%2C%20I%20want%20to%20order`} target="_blank" className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10 hover:bg-[#fff7ed] transition">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] shrink-0">💬</span>
                  <span><div className="text-xs font-bold text-black/60">WhatsApp Alt</div><div className="text-sm font-black text-[#1c0a00]">Message</div><div className="text-[11px] text-black/50">{SITE.whatsappSecondary}</div></span>
                </a>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] shrink-0">⏰</span>
                <div><div className="text-sm font-extrabold">Hours</div><div className="text-sm text-black/70">{SITE.hours} • Breakfast • Lunch • Dinner</div><div className="text-xs text-black/50">Bulk & Tiffin: call in advance</div></div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] shrink-0">✉️</span>
                <div><div className="text-sm font-extrabold">Email</div><div className="text-sm text-black/70">{SITE.email}</div><div className="text-xs text-black/50">For general enquiries</div></div>
                <a href={`mailto:${SITE.email}`} className="ml-auto rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-bold text-white">Mail</a>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a href="/menu" className="rounded-full bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">Order online →</a>
                <a href="/offers" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold hover:bg-[#fff7ed]">View offers</a>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-[24px] bg-[#1c0a00] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
              <div className="rounded-[16px] bg-[#ffedd5] p-3 h-full flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-[#1c0a00]">Find us on Map</div>
                  <a href={SITE.mapsLink} target="_blank" className="rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-black text-white hover:bg-black">Open in Maps →</a>
                </div>
                {SITE.mapsEmbed ? (
                  <iframe src={SITE.mapsEmbed} className="mt-3 h-[380px] lg:h-[520px] w-full rounded-xl border-0" loading="lazy" title="Apna Baithak Map" />
                ) : (
                  <div className="mt-3 grid h-[380px] lg:h-[520px] place-items-center rounded-xl bg-white p-6 text-center ring-1 ring-black/10">
                    <div>
                      <div className="text-4xl">🗺️</div>
                      <div className="mt-2 font-bold">Map</div>
                      <a href={SITE.mapsLink} target="_blank" className="mt-3 inline-flex rounded-full bg-[#ea580c] px-4 py-2 text-xs font-bold text-white">Open Eldeco City on Maps</a>
                    </div>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-black/5"><div className="font-bold">Bulk Order</div><div className="text-black/60">Party • Office • Events</div><a href={`tel:${SITE.phone}`} className="mt-1 inline-flex text-[11px] font-bold text-[#ea580c]">Call now →</a></div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-black/5"><div className="font-bold">Home Delivery</div><div className="text-black/60">Tiffin Service available</div><a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="mt-1 inline-flex text-[11px] font-bold text-[#16a34a]">WhatsApp →</a></div>
                </div>
                <div className="mt-2 text-[11px] text-black/50 text-center">Coordinates: {SITE.coords.lat}, {SITE.coords.lng} • Eldeco City, Lucknow</div>
              </div>
            </div>
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
