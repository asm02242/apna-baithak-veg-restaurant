"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";

type Pic = { src: string; label: string; span?: string };

const RESTAURANT_PICS: Pic[] = [
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.40%20PM.jpeg", label: "Front • Night glow" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.41%20PM.jpeg", label: "Live wok • Flame" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.41%20PM%20(1).jpeg", label: "Counter • Pure Veg" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.41%20PM%20(2).jpeg", label: "Outdoor • Eldeco City" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.42%20PM.jpeg", label: "Seating • Family friendly" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.42%20PM%20(1).jpeg", label: "Kitchen • Fresh prep" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.43%20PM.jpeg", label: "Dining • Warm lights" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.43%20PM%20(1).jpeg", label: "Service • Welcome" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.44%20PM.jpeg", label: "Apna Baithak • Signage" },
  { src: "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.44%20PM%20(1).jpeg", label: "Evening • Crowd favourite" },
];

const FOOD_PICS: string[] = [
  "/images/foods/malai-chaap.jpg",
  "/images/foods/paneer-butter-masala.jpg",
  "/images/foods/schezwan-noodles.jpg",
  "/images/foods/tandoori-momos.jpg",
  "/images/foods/chilli-paneer.jpg",
  "/images/foods/family-combo.jpg",
  "/images/foods/special-thali.jpg",
  "/images/foods/mini-combo.jpg",
  "/images/foods/afghani-chaap.jpg",
  "/images/foods/veg-burger.jpg",
  "/images/foods/cold-coffee.jpg",
  "/images/foods/paneer-tikka-chaap.jpg",
  "/images/foods/hakka-noodles.jpg",
  "/images/foods/malai-chaap-roll.jpg",
  "/images/foods/steam-momos-6-pc.jpg",
  "/images/foods/jeera-rice.jpg",
  "/images/foods/thali.jpg",
  "/images/foods/party-combo.jpg",
  "/images/foods/finger-chips.jpg",
  "/images/foods/kadai-paneer.jpg",
  "/images/foods/chilli-potato.jpg",
  "/images/foods/honey-chilli-potato.jpg",
];

export default function GalleryPage() {
  const [active, setActive] = useState<Pic | { src: string; label: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "food" | "restaurant">("all");

  const allFood: Pic[] = useMemo(() => FOOD_PICS.map((s, i) => ({ src: s, label: s.split("/").pop()?.replace(".jpg", "").replace(/-/g, " ") || `Food ${i + 1}` })), []);

  const visible: (Pic | { src: string; label: string })[] = useMemo(() => {
    if (filter === "food") return allFood;
    if (filter === "restaurant") return RESTAURANT_PICS;
    return [...RESTAURANT_PICS, ...allFood];
  }, [filter, allFood]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const idx = visible.findIndex((p) => p.src === active.src);
        if (idx >= 0) {
          const next = e.key === "ArrowRight" ? (idx + 1) % visible.length : (idx - 1 + visible.length) % visible.length;
          setActive(visible[next]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, visible]);

  // masonry: assign varied heights via span classes
  const spans = ["row-span-1", "row-span-2", "row-span-1"];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[26px] sm:text-[32px] font-black tracking-tight text-[#1c0a00]">Gallery — Food & Restaurant</h1>
            <p className="text-sm text-black/60">Masonry layout • Every image from <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-black/5">/public/images/foods</code> & <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-black/5">/public/gallery</code> • Tap to open lightbox</p>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "all", label: `All • ${RESTAURANT_PICS.length + allFood.length}` },
                { id: "restaurant", label: `Restaurant • ${RESTAURANT_PICS.length}` },
                { id: "food", label: `Food • ${allFood.length}` },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold border transition ${filter === t.id ? "bg-[#1c0a00] text-white border-[#1c0a00]" : "bg-white text-black/70 border-black/10 hover:bg-[#fff7ed]"}`}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-black/40 self-center hidden sm:inline">Lightbox: Esc to close • Arrow keys to navigate</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
            {visible.map((pic, i) => {
              const h = i % 5 === 0 ? "h-[220px]" : i % 3 === 0 ? "h-[260px]" : i % 2 === 0 ? "h-[180px]" : "h-[200px]";
              return (
                <button
                  key={pic.src + i}
                  onClick={() => setActive(pic)}
                  className={`group relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] text-left break-inside-avoid ${h} ${spans[i % spans.length]}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pic.src} alt={pic.label} className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-700" loading="lazy" onError={(e) => ((e.currentTarget.style.display = "none"), ((e.currentTarget.nextElementSibling as HTMLElement).style.display = "grid"))} />
                  <div className="hidden h-full w-full place-items-center bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] text-4xl">🍽️</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow line-clamp-1 max-w-[80%]">{pic.label}</span>
                  <span className="absolute right-2 top-2 rounded-full bg-[#1c0a00] px-2 py-1 text-[10px] font-bold text-white opacity-90">{filter === "restaurant" || RESTAURANT_PICS.some((p) => p.src === pic.src) ? "Restaurant" : "Food"}</span>
                  <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black shadow">View →</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[20px] bg-white p-4 text-center shadow ring-1 ring-black/5">
            <div className="text-sm font-bold text-[#1c0a00]">Add more photos to grow the gallery</div>
            <p className="text-xs text-black/60">Drop images into <code className="rounded bg-[#fff7ed] px-1 py-0.5 ring-1 ring-[#fed7aa]">public/gallery</code> for restaurant photos or <code className="rounded bg-[#fff7ed] px-1 py-0.5 ring-1 ring-[#fed7aa]">public/images/foods</code> for dishes — they’ll appear automatically after you update the list.</p>
          </div>
        </section>
      </main>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div onClick={() => setActive(null)} className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
              <div className="text-sm font-black text-[#1c0a00] line-clamp-1">{active.label}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = visible.findIndex((p) => p.src === active.src);
                    const prev = (idx - 1 + visible.length) % visible.length;
                    setActive(visible[prev]);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full border bg-white text-sm hover:bg-[#fff7ed]"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    const idx = visible.findIndex((p) => p.src === active.src);
                    const next = (idx + 1) % visible.length;
                    setActive(visible[next]);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full border bg-white text-sm hover:bg-[#fff7ed]"
                  aria-label="Next"
                >
                  ›
                </button>
                <button onClick={() => setActive(null)} className="rounded-full bg-[#1c0a00] px-3 py-1.5 text-xs font-black text-white">Close ✕</button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.src} alt={active.label} className="max-h-[72vh] w-full object-contain bg-[#fff7ed]" />
            <div className="flex items-center justify-between gap-3 bg-[#fff7ed] px-4 py-3">
              <div className="text-xs font-bold text-[#1c0a00]">{active.label}</div>
              <a href={active.src} target="_blank" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-white">Open original →</a>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
      <FoodDetailPanel />
      <FloatingButtons />
      <BottomNav />
    </>
  );
}
