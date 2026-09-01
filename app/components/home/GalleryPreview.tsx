export default function GalleryPreview() {
  const imgs = [
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.40%20PM.jpeg",
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.41%20PM.jpeg",
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.42%20PM.jpeg",
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.43%20PM.jpeg",
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.44%20PM.jpeg",
    "/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.41%20PM%20(1).jpeg",
  ];
  return (
    <section id="gallery" className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#1c0a00]">Gallery</h2>
          <p className="mt-1 text-sm text-black/60">Real photos from Apna Baithak — Eldeco City • Click to enlarge</p>
        </div>
        <a href="/gallery" className="hidden sm:inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold shadow ring-1 ring-black/5 hover:bg-[#fff7ed]">View Full Gallery →</a>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {imgs.slice(0, 6).map((src, i) => (
          <a key={src} href={src} target="_blank" className="group relative h-36 sm:h-44 overflow-hidden rounded-[20px] bg-white shadow ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow">{i === 0 ? "Front • Night" : i === 1 ? "Live Wok" : i === 2 ? "Outdoor" : "Apna Baithak"}</span>
          </a>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <a href="/gallery" className="inline-flex items-center justify-center rounded-full bg-[#1c0a00] px-6 py-3 text-sm font-black text-white hover:bg-black transition">View Full Gallery →</a>
      </div>
      <div className="mt-3 text-center text-xs text-black/40">Add more photos to <code className="rounded bg-white px-1.5 py-0.5 ring-1 ring-black/5">public/gallery/</code> — they appear automatically.</div>
    </section>
  );
}
