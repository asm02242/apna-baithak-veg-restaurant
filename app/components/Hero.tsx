import { SITE } from "@/lib/site";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1c0a00]" />
      <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_-10%,rgba(234,88,12,0.35),transparent),radial-gradient(800px_500px_at_85%_30%,rgba(251,146,60,0.18),transparent)]" />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#fed7aa] ring-1 ring-white/15">🌿 Pure Vegetarian • Family Friendly • Fresh Daily</div>
            <h1 className="mt-4 font-display text-[36px] sm:text-[48px] lg:text-[56px] font-black leading-[0.9] text-white">
              APNA <span className="text-[#fb923c]">BAITHAK</span>
            </h1>
            <p className="mt-2 text-[16px] sm:text-[18px] font-semibold tracking-[0.14em] text-[#fed7aa]">Pure Vegetarian Restaurant</p>
            <p className="mt-3 text-sm sm:text-[15px] leading-6 text-white/80 max-w-xl">Eldeco City&apos;s favourite for <b className="text-white">Chaap, Momos, Chinese, Rolls &amp; Main Course</b>. Tandoori, buttery, spicy — all <span className="text-[#86efac] font-semibold">100% Pure Veg</span> and freshly prepared.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#menu" className="inline-flex items-center justify-center rounded-full bg-[#ea580c] px-6 py-3 text-sm font-extrabold text-white shadow hover:bg-[#c2410c] transition">View Menu →</a>
              <a href="#contact" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#1c0a00] hover:bg-[#ffedd5] transition">Order / Contact</a>
              <a href={`tel:${SITE.phone}`} className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition">Call {SITE.phoneDisplay}</a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a] px-3 py-1.5 font-bold text-white">● Pure Veg</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white ring-1 ring-white/15">✓ Freshly Prepared</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white ring-1 ring-white/15">✓ Family Friendly</span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-white/70">
              <span>★ 4.6 rating • 90+ dishes</span><span className="h-1 w-1 rounded-full bg-white/40" /><span>Bulk Order • Home Delivery</span>
            </div>
          </div>

          <div className="relative lg:h-[460px]">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-[24px] bg-[#fb923c]/20 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-[22px] bg-white p-3 sm:p-4 shadow card-hover animate-float-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <img src="/images/foods/malai-chaap.jpg" alt="Malai Chaap" className="h-28 sm:h-36 w-full rounded-2xl object-cover" loading="eager" />
                  <div className="mt-3 font-bold leading-tight">Malai Chaap</div>
                  <div className="text-xs text-black/60">Half ₹150 • Full ₹290</div>
                  <div className="mt-2 text-sm font-extrabold text-[#ea580c]">Full ₹290</div>
                </div>
                <div className="rounded-[22px] bg-[#ffedd5] p-3 sm:p-4 shadow">
                  <img src="/images/foods/tandoori-momos.jpg" alt="Tandoori Momos" className="h-24 sm:h-28 w-full rounded-2xl object-cover" loading="eager" />
                  <div className="mt-2 font-bold">Tandoori Momos</div>
                  <div className="text-xs text-black/60">6 pcs • smoky</div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 pt-6">
                <div className="rounded-[22px] bg-white p-3 sm:p-4 shadow card-hover animate-float-[0_20px_60px_rgba(0,0,0,0.25)]">
                  <img src="/images/foods/schezwan-noodles.jpg" alt="Schezwan Noodles" className="h-28 sm:h-36 w-full rounded-2xl object-cover" loading="eager" />
                  <div className="mt-3 font-bold">Schezwan Noodles</div>
                  <div className="text-xs text-black/60">Half ₹120 • Full ₹230</div>
                </div>
                <div className="rounded-[22px] bg-[#1c0a00] p-4 text-white shadow">
                  <div className="text-xs tracking-widest text-[#fed7aa]">OPEN DAILY</div>
                  <div className="font-display text-lg font-bold">7:30 AM – 10:00 PM</div>
                  <div className="text-xs text-white/70">Breakfast • Lunch • Dinner</div>
                  <div className="mt-3">
                    <a href={`tel:${SITE.phone}`} className="flex w-full justify-center rounded-full bg-[#ea580c] py-2.5 text-sm font-bold">Call {SITE.phoneDisplay}</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold shadow">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" /> Bulk Order • Tiffin Service
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
