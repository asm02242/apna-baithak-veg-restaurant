"use client";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const hasWa = Boolean(SITE.whatsapp);
  const hasPhone = Boolean(SITE.phone);
  if (!hasWa && !hasPhone && !showTop) return null;
  return (
    <div className="fixed bottom-[76px] lg:bottom-4 right-4 z-40 flex flex-col gap-2">
      {hasWa && <a href={`https://wa.me/91${SITE.whatsapp}?text=Hi%20Apna%20Baithak`} target="_blank" aria-label="WhatsApp" className="grid h-12 w-12 place-items-center rounded-full bg-[#16a34a] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-[#15803d]">💬</a>}
      {hasPhone && <a href={`tel:${SITE.phone}`} aria-label="Call" className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-[#c2410c]">📞</a>}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="grid h-12 w-12 place-items-center rounded-full bg-[#1c0a00] text-white shadow">↑</button>
      )}
    </div>
  );
}
