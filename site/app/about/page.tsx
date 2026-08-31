import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import FoodDetailPanel from "../components/FoodDetailPanel";
import FloatingButtons from "../components/FloatingButtons";
import BottomNav from "../components/BottomNav";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About — Apna Baithak | Pure Veg Restaurant, Eldeco City",
  description: "Apna Baithak — Pure vegetarian, family-friendly restaurant in Eldeco City, Lucknow. Chaap, momos, Chinese & more. Freshly prepared, honest taste.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
            <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] flex flex-col">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-black text-[#16a34a] ring-1 ring-[#16a34a]/20">● 100% Pure Veg • Eldeco City, Lucknow</div>
              <h1 className="mt-3 font-display text-[28px] sm:text-[40px] font-black leading-[0.95] tracking-tight text-[#1c0a00]">
                Apna Baithak — <span className="text-[#ea580c]">Apni jagah, apna swaad.</span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-black/65">
                A neighbourhood vegetarian kitchen built for families, friends and everyday cravings. We keep it simple: freshly prepared food, clean flavours, and a warm place to sit — whether you’re ordering a quick chaap roll on the go or a Family Combo for the whole table.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#fff7ed] p-3 ring-1 ring-[#fed7aa] text-center">
                  <div className="text-lg">🍢</div>
                  <div className="text-xs font-black">Roasted Chaap</div>
                  <div className="text-[11px] text-black/60">Smoky • Creamy • Chatpata</div>
                </div>
                <div className="rounded-2xl bg-[#fff7ed] p-3 ring-1 ring-[#fed7aa] text-center">
                  <div className="text-lg">🥟</div>
                  <div className="text-xs font-black">Momos & Rolls</div>
                  <div className="text-[11px] text-black/60">Steamed • Fried • Tandoori</div>
                </div>
                <div className="rounded-2xl bg-[#fff7ed] p-3 ring-1 ring-[#fed7aa] text-center">
                  <div className="text-lg">🍜</div>
                  <div className="text-xs font-black">Wok & Main</div>
                  <div className="text-[11px] text-black/60">Noodles • Paneer • Thali</div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="/menu" className="rounded-full bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c] shadow">Explore menu →</a>
                <a href="/combos" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold hover:bg-[#fff7ed]">View combos</a>
                <a href="/contact" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold hover:bg-[#fff7ed]">Visit us</a>
              </div>
            </div>
            <div className="rounded-[28px] overflow-hidden bg-[#1c0a00] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
              <div className="grid h-full gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/foods/malai-chaap.jpg" alt="Malai Chaap" className="h-36 w-full object-cover rounded-2xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/foods/special-thali.jpg" alt="Special Thali" className="h-36 w-full object-cover rounded-2xl" />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.40%20PM.jpeg" alt="Restaurant" className="h-[220px] w-full object-cover rounded-2xl" />
                <div className="rounded-2xl bg-white p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#1c0a00]">Eldeco City • Dine-in • Takeaway • Delivery</div>
                    <div className="text-xs text-black/60">{SITE.hours} • All days • Family-friendly</div>
                  </div>
                  <span className="rounded-full bg-[#16a34a] px-3 py-1 text-xs font-black text-white">Pure Veg</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-[20px] bg-white p-5 shadow ring-1 ring-black/5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] ring-1 ring-[#fed7aa]">🌿</div>
              <div className="mt-3 text-sm font-black text-[#1c0a00]">Pure Veg Identity</div>
              <p className="mt-1 text-xs leading-5 text-black/65">Every dish is 100% vegetarian, cooked in a dedicated veg kitchen. From marination to plating, we keep ingredients fresh and handling clean — so families can order with confidence.</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#16a34a]/10 px-2.5 py-1 text-[11px] font-bold text-[#16a34a] ring-1 ring-[#16a34a]/20"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /> PURE VEG • No compromise</div>
            </div>
            <div className="rounded-[20px] bg-white p-5 shadow ring-1 ring-black/5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] ring-1 ring-[#fed7aa]">🔥</div>
              <div className="mt-3 text-sm font-black text-[#1c0a00]">Food Philosophy</div>
              <p className="mt-1 text-xs leading-5 text-black/65">Tandoor, wok and fresh batter — not shortcuts. Chaap is marinated overnight; momos are steamed to order; noodles are wok-tossed. Half & Full portions, balanced spice, and honest pricing.</p>
              <div className="mt-3 flex gap-1.5 flex-wrap"><span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-bold">Fresh</span><span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-bold">Hot</span><span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-bold">Generous</span></div>
            </div>
            <div className="rounded-[20px] bg-white p-5 shadow ring-1 ring-black/5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff7ed] ring-1 ring-[#fed7aa]">👨‍👩‍👧</div>
              <div className="mt-3 text-sm font-black text-[#1c0a00]">Family-Friendly, Everyday</div>
              <p className="mt-1 text-xs leading-5 text-black/65">High chairs, shared tables, and a menu that works for kids and grandparents alike. Tiffin service, bulk & party orders, and quick delivery across Eldeco City — we’re built for daily meals, not just occasions.</p>
              <div className="mt-3 text-[11px] font-bold text-[#ea580c]">Bulk • Tiffin • Home Delivery • Party combos</div>
            </div>
          </div>
        </section>

        {/* What we serve */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-6">
          <div className="rounded-[24px] bg-[#1c0a00] p-6 text-white">
            <h2 className="font-display text-xl font-black">What we serve — and why it works</h2>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-5">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-black text-white">Roasted Chaap (15+ variants)</div>
                <div className="text-white/75 mt-1">Malai, Afghani, Achari, Nagin, Paneer Tikka — tandoor-roasted, creamy on the inside, crisp at the edges. Half/Full to match appetite.</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-black text-white">Momos & Rolls</div>
                <div className="text-white/75 mt-1">Veg & paneer, steamed/fried/tandoori/afghani. Chaap rolls for a complete grab-and-go meal with chutney.</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-black text-white">Wok & Chinese</div>
                <div className="text-white/75 mt-1">Schezwan, Hakka, paneer & chilli potato — crunchy veg, garlic, and house sauce. Pair with fried rice or noodles.</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <div className="font-black text-white">Main Course & Thali</div>
                <div className="text-white/75 mt-1">Kadai paneer, butter masala, dal, chaap curries, plus Thali & Special Thali for a full family plate. Pure veg comfort.</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="text-sm font-bold text-[#1c0a00]">Craving today? <span className="font-normal text-black/60">Order directly or view live menu with real availability.</span></div>
              <div className="flex gap-2">
                <a href="/menu" className="rounded-full bg-[#ea580c] px-5 py-2 text-xs font-black text-white hover:bg-[#c2410c]">Order now</a>
                <a href={`tel:${SITE.phone}`} className="rounded-full bg-[#1c0a00] px-5 py-2 text-xs font-bold text-white">Call {SITE.phoneDisplay}</a>
              </div>
            </div>
          </div>
        </section>

        {/* Imagery strip + invite */}
        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-[24px] bg-white p-5 shadow ring-1 ring-black/5">
              <h3 className="font-display text-lg font-black text-[#1c0a00]">A place to linger</h3>
              <p className="mt-1 text-xs leading-5 text-black/65">Warm lights, easy seating and the smell of the tandoor in the evening. Many of our guests are regulars from the neighbourhood — they come for a quick bite after work, a family dinner on weekends, or a bulk order for a house party. We’re not chasing trends; we’re keeping the baithak alive.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gallery/WhatsApp%20Image%202026-08-23%20at%2011.08.42%20PM.jpeg" alt="Interior" className="h-24 w-full object-cover rounded-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/foods/kadai-chaap.jpg" alt="Kadai Chaap" className="h-24 w-full object-cover rounded-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/foods/tandoori-momos.jpg" alt="Tandoori Momos" className="h-24 w-full object-cover rounded-xl" />
              </div>
              <div className="mt-3 text-[11px] text-black/40">Photos are from Apna Baithak — real dishes and real space. See more in <a href="/gallery" className="font-bold text-[#ea580c] underline">Gallery</a>.</div>
            </div>
            <div className="rounded-[24px] bg-[#fff7ed] p-6 ring-1 ring-[#fed7aa]">
              <h3 className="text-sm font-black text-[#1c0a00]">Visit us</h3>
              <p className="text-sm text-black/70">{SITE.fullAddress}</p>
              <p className="mt-1 text-sm text-black/60">{SITE.hours} • All days</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={`tel:${SITE.phone}`} className="flex items-center gap-3 rounded-2xl bg-[#1c0a00] p-4 text-white">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#1c0a00]">📞</span>
                  <span><div className="text-xs font-bold opacity-80">Call primary</div><div className="text-sm font-black">{SITE.phoneDisplay}</div></span>
                </a>
                <a href={`https://wa.me/91${SITE.whatsapp}?text=Hi%20Apna%20Baithak`} target="_blank" className="flex items-center gap-3 rounded-2xl bg-[#16a34a] p-4 text-white">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#16a34a]">💬</span>
                  <span><div className="text-xs font-bold">WhatsApp</div><div className="text-sm font-bold">Chat to order</div></span>
                </a>
              </div>
              <a href={SITE.mapsLink} target="_blank" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold ring-1 ring-black/10 hover:bg-white">Get directions →</a>
              <p className="mt-4 text-xs leading-5 text-black/60">We don’t invent a founding year here. What matters is today’s food and today’s service — cooked fresh, served hot, pure veg, every time. If you’ve been looking for <em>your</em> baithak in the city, welcome in.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
      <FoodDetailPanel />
      <FloatingButtons />
      <BottomNav />
    </>
  );
}
