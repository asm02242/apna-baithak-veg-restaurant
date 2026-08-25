"use client";

export default function OffersBanner() {
  const offers = [
    { bg: "from-[#ea580c] to-[#f97316]", title: "₹75 OFF", sub: "On orders ₹499+", icon: "🎉" },
    { bg: "from-[#1c0a00] to-[#7c2d12]", title: "₹150 OFF", sub: "On orders ₹999+", icon: "💥" },
    { bg: "from-[#16a34a] to-[#15803d]", title: "FREE ITEM ₹200", sub: "Order ₹1500+ get item free", icon: "🎁" },
    { bg: "from-[#7c3aed] to-[#5b21b6]", title: "FREE ITEM ₹250", sub: "Order ₹2000+ get item free", icon: "🏆" },
    { bg: "from-[#0ea5e9] to-[#0369a1]", title: "BULK ORDERS", sub: "₹3000+ custom quote • Call us", icon: "📦" },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {offers.map((o) => (
          <div key={o.title} className={`snap-start shrink-0 w-[280px] sm:w-[340px] rounded-2xl bg-gradient-to-br ${o.bg} p-4 text-white shadow-lg card-hover`}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-xl backdrop-blur">{o.icon}</span>
              <div>
                <div className="text-sm font-black leading-none">{o.title}</div>
                <div className="text-xs opacity-90">{o.sub}</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] opacity-75">Pure Veg • Choose only one offer per order</div>
          </div>
        ))}
      </div>
    </section>
  );
}
