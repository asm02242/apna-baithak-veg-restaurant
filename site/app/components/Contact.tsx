import { SITE } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
          <h2 className="font-display text-2xl font-black text-[#1c0a00]">Contact</h2>
          <p className="mt-1 text-sm text-black/60">Call / WhatsApp for orders • Bulk • Tiffin • Home Delivery</p>
          <div className="mt-5 grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[#fff7ed] p-4 ring-1 ring-[#fed7aa]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ea580c] text-white">📍</div>
              <div><div className="text-sm font-extrabold">Address</div><div className="text-sm text-black/70">{SITE.fullAddress}</div></div>
            </div>
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 rounded-2xl bg-[#1c0a00] p-4 text-white hover:bg-black">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1c0a00]">📞</div>
              <div><div className="text-sm font-bold">Phone</div><div className="text-sm">{SITE.phoneDisplay} • Tap to call</div></div>
            </a>
            <a href={`https://wa.me/91${SITE.whatsapp}?text=Hi%20Apna%20Baithak%2C%20I%20want%20to%20order`} target="_blank" className="flex items-center gap-3 rounded-2xl bg-[#16a34a] p-4 text-white hover:bg-[#15803d]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#16a34a]">💬</div>
              <div><div className="text-sm font-bold">WhatsApp</div><div className="text-sm">Chat to order • wa.me/91{SITE.whatsapp}</div></div>
            </a>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/10">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed]">⏰</div>
              <div><div className="text-sm font-extrabold">Hours</div><div className="text-sm text-black/70">{SITE.hours}</div></div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-[#ffedd5] p-3 text-xs text-black/70">To change phone/address/hours: edit <code className="rounded bg-white px-1">lib/site.ts</code></div>
        </div>
        <div className="rounded-[24px] bg-[#1c0a00] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <div className="rounded-[16px] bg-[#ffedd5] p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-[#1c0a00]">Find us on Map</div>
              <a href={SITE.mapsLink} target="_blank" className="rounded-full bg-[#1c0a00] px-3 py-1 text-xs font-bold text-white">Open in Maps →</a>
            </div>
            {SITE.mapsEmbed ? (
              <iframe src={SITE.mapsEmbed} className="mt-3 h-[320px] w-full rounded-xl border-0" loading="lazy" />
            ) : (
              <div className="mt-3 grid h-[320px] place-items-center rounded-xl bg-white p-6 text-center ring-1 ring-black/10">
                <div>
                  <div className="text-4xl">🗺️</div>
                  <div className="mt-2 font-bold">Google Maps placeholder</div>
                  <div className="text-xs text-black/60">Add your embed URL in <code>lib/site.ts → mapsEmbed</code></div>
                  <a href={SITE.mapsLink} target="_blank" className="mt-3 inline-flex rounded-full bg-[#ea580c] px-4 py-2 text-xs font-bold text-white">Open Eldeco City on Maps</a>
                </div>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white p-3 ring-1 ring-black/5"><div className="font-bold">Bulk Order</div><div className="text-black/60">Party • Office • Family</div></div>
              <div className="rounded-xl bg-white p-3 ring-1 ring-black/5"><div className="font-bold">Home Delivery</div><div className="text-black/60">Tiffin Service</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
