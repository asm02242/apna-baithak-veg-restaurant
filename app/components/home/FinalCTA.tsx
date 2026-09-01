import { SITE } from "@/lib/site";

export default function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
      <div className="relative overflow-hidden rounded-[28px] bg-[#1c0a00] p-6 sm:p-8 lg:p-10 shadow-[0_16px_48px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_20%_0%,rgba(234,88,12,0.32),transparent),radial-gradient(700px_500px_at_85%_100%,rgba(251,146,60,0.18),transparent)]" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#fed7aa] ring-1 ring-white/15">READY TO ORDER?</div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black leading-tight text-white">Craving Chaap, Momos<br />or Desi Chinese?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">Freshly prepared • Pure Veg • Eldeco City • Home delivery & takeaway. Tap Order Now — choose your dishes in seconds.</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#16a34a]/20 px-3 py-1 text-xs font-bold text-[#86efac]">● 100% Pure Veg • Quick Service</div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a href="#menu" className="inline-flex items-center justify-center rounded-full bg-[#ea580c] px-7 py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(234,88,12,0.35)] hover:bg-[#c2410c] transition">ORDER NOW →</a>
            <a href={`tel:${SITE.phone}`} className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-black text-[#1c0a00] hover:bg-[#ffedd5] transition">Call {SITE.phoneDisplay}</a>
            <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/15 transition backdrop-blur">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
