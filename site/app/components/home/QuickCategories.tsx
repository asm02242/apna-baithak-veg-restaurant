"use client";

const categories = [
  { id: "chinese", name: "Chinese Food", icon: "🍜", img: "/images/foods/schezwan-noodles.jpg", count: "15 items" },
  { id: "roasted-chaap", name: "Roasted Chaap", icon: "🍢", img: "/images/foods/malai-chaap.jpg", count: "15 items" },
  { id: "chaap-rolls", name: "Chaap Rolls", icon: "🌯", img: "/images/foods/malai-chaap-roll.jpg", count: "6 items" },
  { id: "main-course", name: "Main Course", icon: "🍛", img: "/images/foods/paneer-butter-masala.jpg", count: "10 items" },
  { id: "momos", name: "Momos", icon: "🥟", img: "/images/foods/afghani-momos.jpg", count: "17 items" },
  { id: "burgers", name: "Burgers / Snacks", icon: "🍔", img: "/images/foods/paneer-burger.jpg", count: "6 items" },
  { id: "beverages", name: "Beverages", icon: "🥤", img: "/images/foods/cold-coffee.jpg", count: "7 items" },
  { id: "combos", name: "Combos", icon: "🍱", img: "/images/foods/family-combo.jpg", count: "3 items" },
];

export default function QuickCategories() {
  const onSelect = (id: string) => {
    // if on home page, scroll to menu section or navigate to /menu?category=
    if (document.getElementById("menu")) {
      window.dispatchEvent(new CustomEvent("select-category", { detail: id }));
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = `/menu?category=${encodeURIComponent(id)}`;
    }
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] sm:text-[28px] font-black tracking-tight text-[#1c0a00]">Quick Categories</h2>
          <p className="mt-1 text-sm text-black/60">Tap any card — filters the menu instantly • Pure Veg only</p>
        </div>
        <a href="/menu" className="hidden sm:inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold shadow ring-1 ring-black/5 hover:bg-[#fff7ed] transition">View Full Menu →</a>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="group snap-start shrink-0 w-[148px] sm:w-[168px] text-left overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] hover:shadow-[0_14px_36px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition"
          >
            <div className="relative h-[112px] overflow-hidden bg-[#fff7ed]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-[1.06] transition duration-500" onError={(e) => ((e.currentTarget.style.display = "none"))} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
              <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black shadow">● PURE VEG</span>
              <span className="absolute right-2 top-2 rounded-full bg-[#1c0a00] px-2 py-1 text-[10px] font-bold text-white">{c.count}</span>
              <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-white text-sm shadow">{c.icon}</span>
            </div>
            <div className="p-3">
              <div className="text-[13px] font-extrabold leading-tight text-[#1c0a00] line-clamp-1">{c.name}</div>
              <div className="text-[11px] font-semibold text-[#ea580c]">Explore →</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
