"use client";
import { SITE } from "@/lib/site";

export default function HeroPremium() {
  return (
    <section id="home" className="relative overflow-hidden bg-[#1c0a00]">
      <div className="absolute inset-0 bg-[radial-gradient(700px_500px_at_18%_-10%,rgba(234,88,12,0.38),transparent),radial-gradient(900px_600px_at_88%_28%,rgba(251,146,60,0.16),transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#fed7aa] ring-1 ring-white/15 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" /> 100% PURE VEGETARIAN • ELDECO CITY • FRESH DAILY
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl overflow-hidden bg-black ring-1 ring-[#f59e0b]/40 shadow-[0_0_18px_rgba(245,158,11,0.35)] grid place-items-center shrink-0">
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
                <span className="hidden h-full w-full place-items-center bg-[#ea580c] text-white font-black text-lg">AB</span>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-[0.18em] text-[#fb923c]">ESTD • LUCKNOW</div>
                <div className="text-xs font-semibold text-white/60">Eldeco City&apos;s favourite</div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#16a34a] px-3 py-1.5 text-xs font-black text-white shadow">
                <span className="h-3 w-3 rounded-[3px] border border-white grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-white" /></span> PURE VEG
              </span>
            </div>

            <h1 className="mt-4 font-display text-[38px] sm:text-[52px] lg:text-[60px] font-black leading-[0.88] tracking-tight text-white">
              APNA <span className="text-[#fb923c]">BAITHAK</span>
            </h1>
            <p className="mt-2 text-[15px] sm:text-[17px] font-semibold tracking-[0.14em] text-[#fed7aa]">Pure Vegetarian Restaurant</p>
            <p className="mt-3 max-w-xl text-[14px] sm:text-[15px] leading-6 text-white/80">
              {SITE.description} Tandoori, buttery, spicy — all <span className="font-semibold text-[#86efac]">100% Pure Veg</span> and freshly prepared for family dinners, tiffin & bulk orders.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-full bg-[#ea580c] px-7 py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(234,88,12,0.35)] hover:bg-[#c2410c] hover:shadow-[0_12px_28px_rgba(234,88,12,0.45)] transition"
              >
                ORDER NOW →
              </a>
              <a
                href="/menu"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#1c0a00] shadow hover:bg-[#ffedd5] transition"
              >
                EXPLORE MENU
              </a>
              <a href={`tel:${SITE.phone}`} className="hidden sm:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/15 transition backdrop-blur">
                Call {SITE.phoneDisplay}
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1c0a00] shadow">★ 4.6 • 90+ dishes</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">✓ Freshly Prepared</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">✓ Family Friendly</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">✓ Quick Service</span>
            </div>
            <div className="mt-3 text-xs text-white/55">{SITE.hours} • Bulk Order • Home Delivery • Tiffin</div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 h-28 w-28 rounded-[28px] bg-[#fb923c]/20 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-[28px] bg-[#16a34a]/15 blur-2xl" />
            <div className="relative rounded-[28px] bg-white p-3 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-[20px] bg-[#fff7ed] ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/foods/malai-chaap.jpg" alt="Malai Chaap" className="h-32 sm:h-40 w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-extrabold leading-tight text-[#1c0a00]">Malai Chaap</div>
                      <div className="text-xs text-black/60">Half ₹150 • Full ₹290</div>
                      <div className="mt-1 text-sm font-black text-[#ea580c]">Full ₹290</div>
                    </div>
                  </div>
                  <div className="rounded-[20px] bg-[#1c0a00] p-4 text-white">
                    <div className="text-[11px] tracking-[0.16em] text-[#fed7aa] font-bold">OPEN DAILY</div>
                    <div className="font-display text-[18px] font-black">7:30 AM – 10:00 PM</div>
                    <div className="text-xs text-white/70">Breakfast • Lunch • Dinner</div>
                    <div className="mt-3 flex gap-2">
                      <a href={`tel:${SITE.phone}`} className="flex-1 rounded-full bg-[#ea580c] py-2 text-center text-xs font-black">Call</a>
                      <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="flex-1 rounded-full bg-white py-2 text-center text-xs font-black text-[#1c0a00]">WhatsApp</a>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <div className="overflow-hidden rounded-[20px] bg-white ring-1 ring-black/5 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/foods/schezwan-noodles.jpg" alt="Schezwan Noodles" className="h-28 sm:h-36 w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-extrabold text-[#1c0a00]">Schezwan Noodles</div>
                      <div className="text-xs text-black/60">Wok tossed • desi Chinese</div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[20px] bg-[#fff7ed] ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/foods/tandoori-momos.jpg" alt="Tandoori Momos" className="h-24 sm:h-28 w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-bold text-[#1c0a00]">Tandoori Momos</div>
                      <div className="text-xs text-black/60">6 pcs • smoky & spicy</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Offer badge */}
              <div className="absolute -right-2 -top-2 sm:right-3 sm:top-3 rotate-[6deg]">
                <div className="rounded-2xl bg-[#ea580c] px-3 py-2 text-white shadow-lg ring-4 ring-white">
                  <div className="text-[11px] font-black leading-none">₹75 OFF</div>
                  <div className="text-[10px] font-semibold opacity-90">on ₹499+</div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-black shadow-lg ring-1 ring-black/5">
                <span className="h-2 w-2 inline-block rounded-full bg-[#16a34a] animate-pulse mr-1.5" /> Bulk Order • Tiffin Service • Home Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
