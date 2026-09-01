export default function WhyApnaBaithak() {
  const features = [
    { title: "100% Pure Veg", desc: "Green dot on every dish. No egg, no non-veg — trusted by families.", icon: "🌿", accent: "bg-[#f0fdf4] ring-[#bbf7d0] text-[#16a34a]" },
    { title: "Freshly Prepared", desc: "Made to order, served hot. Wok-tossed, tandoor-fired, desi flavours.", icon: "🔥", accent: "bg-[#fff7ed] ring-[#fed7aa] text-[#ea580c]" },
    { title: "Family Friendly", desc: "Clean, comfortable & welcoming. Perfect for family dinners & teams.", icon: "👨‍👩‍👧‍👦", accent: "bg-[#fefce8] ring-[#fde68a] text-[#ca8a04]" },
    { title: "Quick Service", desc: "Fast prep & delivery. Bulk & tiffin available across Eldeco City.", icon: "⚡", accent: "bg-[#eff6ff] ring-[#bfdbfe] text-[#2563eb]" },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-[24px] bg-white p-4 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-black tracking-wide text-[#16a34a]">WHY APNA BAITHAK</div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black leading-tight text-[#1c0a00]">Pure Veg. Fresh Taste.<br className="hidden sm:block" /> Loved by families.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-black/60">Eldeco City’s neighbourhood restaurant for Chaap, Momos, Chinese, Rolls & Main Course — consistent taste, generous portions, quick service.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className={`rounded-[20px] p-5 ring-1 ${f.accent} card-hover`}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow ring-1 ring-black/5">{f.icon}</div>
              <div className="mt-3 text-sm font-extrabold text-[#1c0a00]">{f.title}</div>
              <div className="mt-1 text-xs leading-5 text-black/60">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#1c0a00] px-3 py-1.5 font-bold text-white">Breakfast • Lunch • Dinner</span>
          <span className="rounded-full bg-white px-3 py-1.5 font-bold ring-1 ring-black/10">7:30 AM – 10:00 PM • All Days</span>
          <span className="rounded-full bg-[#fff7ed] px-3 py-1.5 font-bold ring-1 ring-[#fed7aa]">90+ Dishes • 8 Categories</span>
        </div>
      </div>
    </section>
  );
}
