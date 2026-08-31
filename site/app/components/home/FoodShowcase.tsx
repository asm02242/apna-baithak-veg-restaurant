import { SITE } from "@/lib/site";

export default function FoodShowcase() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-2">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        {/* Large visual */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#1c0a00] p-2 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/foods/paneer-butter-masala.jpg" alt="Paneer Butter Masala" className="h-44 sm:h-[220px] w-full rounded-[20px] object-cover" />
              <div className="grid grid-cols-2 gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/foods/afghani-momos.jpg" alt="Momos" className="h-28 w-full rounded-[20px] object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/foods/malai-chaap.jpg" alt="Chaap" className="h-28 w-full rounded-[20px] object-cover" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="rounded-[20px] bg-white p-5">
                <div className="text-xs font-black tracking-[0.12em] text-[#ea580c]">FROM TANDOOR & WOK</div>
                <div className="mt-1 font-display text-2xl font-black leading-tight text-[#1c0a00]">Buttery. Tandoori.<br />Desi Chinese.</div>
                <p className="mt-2 text-sm leading-6 text-black/60">Paneer Butter Masala, Kadai Chaap, Schezwan Noodles, Chilli Paneer — all pure veg, freshly prepared and served hot.</p>
                <div className="mt-4 flex gap-2">
                  <a href="#menu" className="flex-1 rounded-full bg-[#ea580c] py-2.5 text-center text-sm font-black text-white hover:bg-[#c2410c]">Order Now →</a>
                  <a href="/menu" className="flex-1 rounded-full border bg-white py-2.5 text-center text-sm font-black hover:bg-[#fff7ed]">View Menu</a>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/foods/schezwan-noodles.jpg" alt="Noodles" className="h-40 w-full rounded-[20px] object-cover" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow">
            <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" /> Bulk • Tiffin • Home Delivery
          </div>
        </div>

        {/* Side stack */}
        <div className="grid grid-rows-[1fr_auto] gap-4">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] flex flex-col justify-center">
            <div className="inline-flex w-fit rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#ea580c] ring-1 ring-[#fed7aa]">ELDECO CITY • LUCKNOW</div>
            <h3 className="mt-3 font-display text-[26px] font-black leading-tight text-[#1c0a00]">Your neighbourhood<br />pure veg spot</h3>
            <p className="mt-2 text-sm leading-6 text-black/60">We keep it simple: great ingredients, generous portions, quick service. Dine-in with family or order for home — same taste, every time.</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#fff7ed] p-3 ring-1 ring-[#fed7aa]"><div className="text-xl font-black text-[#1c0a00]">90+</div><div className="text-[11px] font-bold text-black/60">Dishes</div></div>
              <div className="rounded-2xl bg-[#f0fdf4] p-3 ring-1 ring-[#bbf7d0]"><div className="text-xl font-black text-[#16a34a]">100%</div><div className="text-[11px] font-bold text-black/60">Pure Veg</div></div>
              <div className="rounded-2xl bg-[#1c0a00] p-3 text-white"><div className="text-xl font-black">4.6★</div><div className="text-[11px] font-bold text-white/70">Rating</div></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`tel:${SITE.phone}`} className="rounded-full bg-[#1c0a00] px-4 py-2 text-xs font-black text-white hover:bg-black">Call {SITE.phoneDisplay}</a>
              <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="rounded-full bg-[#16a34a] px-4 py-2 text-xs font-black text-white hover:bg-[#15803d]">WhatsApp Order</a>
            </div>
          </div>
          <div className="rounded-[24px] bg-[#ea580c] p-4 text-white flex items-center justify-between">
            <div><div className="text-sm font-black">Need a party quote?</div><div className="text-xs opacity-90">Bulk orders • Office • Family events</div></div>
            <a href={`tel:${SITE.phone}`} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#ea580c] hover:bg-[#fff7ed]">Call Now</a>
          </div>
        </div>
      </div>
    </section>
  );
}
