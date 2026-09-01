import Link from "next/link";
import { SITE } from "@/lib/site";

const map = [
  {
    title: "Home",
    url: "/",
    desc: "Hero, Offers, Categories, Best Sellers",
    children: [
      { label: "Hero — Pure Veg", url: "/#home" },
      { label: "Offers — FREE Delivery, WELCOME50", url: "/#home" },
      { label: "Categories — 8 categories with images", url: "/#home" },
    ],
  },
  {
    title: "Menu",
    url: "/#menu",
    desc: "84 dishes, search, filter, add to cart, left detail panel",
    children: [
      { label: "All • 84", url: "/#menu" },
      { label: "Chinese — Noodles, Fried Rice", url: "/#menu" },
      { label: "Roasted Chaap — Malai, Afghani", url: "/#menu" },
      { label: "Print Menu", url: "/menu" },
    ],
  },
  {
    title: "Cart & Checkout",
    url: "/checkout",
    desc: "Right drawer cart, left detail, bill, coupons, Razorpay",
    children: [
      { label: "Cart Drawer — right, compact", url: "/#menu" },
      { label: "Detail Panel — left, reviews", url: "/#menu" },
      { label: "Checkout — address, slot, Razorpay/COD", url: "/checkout" },
      { label: "API — /api/razorpay/order", url: "/api/razorpay/order" },
    ],
  },
  {
    title: "Account",
    url: "/login",
    desc: "Per-user wishlist, favourites, addresses (localStorage)",
    children: [
      { label: "Login", url: "/login" },
      { label: "Sign Up", url: "/signup" },
      { label: "Wishlist — heart on cards", url: "/#menu" },
    ],
  },
  {
    title: "Info",
    url: "/#about",
    desc: "About, Gallery, Contact, Map",
    children: [
      { label: "About — 90+ dishes", url: "/#about" },
      { label: "Gallery — 10 images", url: "/#gallery" },
      { label: "Contact — 9454999442, Maps", url: "/#contact" },
      { label: "Sitemap — this page", url: "/sitemap" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#fff7ed]">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="mx-auto max-w-[900px] px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-black text-white">AB</span> APNA BAITHAK — Sitemap
          </Link>
          <span className="text-xs font-bold bg-[#fff7ed] border px-3 py-1 rounded-full">{SITE.fullAddress}</span>
        </div>
      </div>
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <h1 className="font-display text-3xl font-black">Website Map</h1>
        <p className="text-sm text-black/60 mt-1">Clean structure — 5 main sections, 12 routes. Click any link. Last updated {new Date().toLocaleDateString("en-IN")}.</p>

        <div className="mt-6 grid gap-4">
          {map.map((sec) => (
            <div key={sec.title} className="rounded-2xl bg-white p-5 shadow ring-1 ring-black/5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-black text-lg">
                  <Link href={sec.url} className="hover:text-[#ea580c]">{sec.title}</Link>
                </h2>
                <span className="text-xs font-mono bg-[#f7f7f7] px-2 py-1 rounded-full">{sec.url}</span>
              </div>
              <p className="text-xs text-black/60 mt-1">{sec.desc}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sec.children.map((c) => (
                  <Link key={c.label} href={c.url} className="rounded-full bg-[#fff7ed] border px-3 py-1.5 text-xs font-bold hover:bg-[#ea580c] hover:text-white hover:border-[#ea580c]">
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-[#1c0a00] text-white p-5">
          <div className="text-sm font-black">For Admin — later</div>
          <div className="text-xs text-white/70 mt-1">/admin (planned) — login to edit prices/descriptions via data/menu.ts, manage orders. Ask me to build it.</div>
          <div className="mt-3 text-xs font-mono break-all bg-white/10 rounded-xl p-3">Sitemap XML: /sitemap.xml • Robots: /robots.txt</div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
