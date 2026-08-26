import Link from "next/link";
import { SITE } from "@/lib/site";
import PrintButton from "./PrintButton";

export const metadata = {
  title: "Menu — APNA BAITHAK | Pure Veg Restaurant",
  description: "Full menu of Apna Baithak — Chaap, Momos, Chinese, Rolls, Main Course, Breakfast, Thali and more. Eldeco City, Lucknow. Call 8299751213",
};

function Price({ half, full, single }: { half?: number; full?: number; single?: number }) {
  if (half !== undefined && full !== undefined) {
    return (
      <span className="tabular-nums">
        <span className="inline-block w-[48px] text-right">{half}/-</span>
        <span className="mx-2 text-black/20">/</span>
        <span className="inline-block w-[48px] text-right">{full}/-</span>
      </span>
    );
  }
  return <span className="tabular-nums">{single}/-</span>;
}

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#fff7ed] print:bg-white">
      <div className="sticky top-0 z-30 bg-[#1c0a00] text-white print:hidden">
        <div className="mx-auto max-w-[1280px] px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-display text-lg font-black">← APNA BAITHAK</Link>
          <div className="flex gap-2">
            <Link href="/#menu" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1c0a00]">Order Online</Link>
            <PrintButton className="rounded-full bg-[#ea580c] px-4 py-2 text-sm font-bold text-white print:hidden">Print Menu</PrintButton>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] bg-[#d97706] print:bg-[#d97706] px-2 sm:px-4 py-4">
        {/* Header */}
        <div className="rounded-[18px] bg-[#d97706] overflow-hidden">
          <div className="bg-[#d97706] px-3 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-white grid place-items-center text-[#7c2d12] font-black shadow">AB</div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold tracking-[0.2em] text-white">PURE VEG • FRESH TASTE</div>
                <div className="font-display text-2xl font-black leading-none text-white">APNA BAITHAK</div>
                <div className="text-sm font-bold tracking-widest text-white/90">VEGETERIAN RESTUARANT • ELDECO CITY, LUCKNOW</div>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#9a3412]">📞 {SITE.phoneDisplay}</div>
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white mt-1">📞 {SITE.phoneDisplaySecondary}</div>
              <div className="mt-1 text-xs font-semibold">7:30 AM – 10 PM • Bulk • Tiffin • Home Delivery</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-2 pb-2">
            <div className="rounded-xl bg-white px-3 py-2 text-center">
              <div className="text-xs font-black text-[#9a3412]">COMBO</div>
              <div className="text-xs font-bold leading-tight">Manchuriyan Fry Rice + Cold Drink</div>
              <div className="text-sm font-black text-[#ea580c]">Rs. 160/- Only</div>
            </div>
            <div className="rounded-xl bg-white py-2 text-center">
              <div className="font-display text-3xl font-black tracking-tight text-[#d97706]">MENU</div>
              <div className="text-xs font-bold text-[#9a3412]">PURE VEG • 90+ DISHES • ELDECO CITY</div>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-center">
              <div className="text-xs font-black text-[#9a3412]">COMBO</div>
              <div className="text-xs font-bold leading-tight">Burger + Finger + Cold Drink</div>
              <div className="text-sm font-black text-[#ea580c]">Rs. 140/- Only</div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Breakfast */}
          <div className="rounded-xl bg-white p-3">
            <div className="text-center font-black text-[#d97706] text-sm">Breakfast</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span>Samosa</span><span className="font-bold">12/-</span></div>
              <div className="flex justify-between"><span>Samosa Chola</span><span className="font-bold">25/-</span></div>
              <div className="flex justify-between"><span>Paneer Samosa</span><span className="font-bold">15/-</span></div>
              <div className="flex justify-between"><span>Puri Sabji (4pc.)</span><span className="font-bold">50/-</span></div>
              <div className="flex justify-between"><span>Chola Butura (2pc.)</span><span className="font-bold">60/-</span></div>
              <div className="flex justify-between"><span>Khasta Chola</span><span className="font-bold">25/-</span></div>
              <div className="flex justify-between"><span>Jalebi (1 kg)</span><span className="font-bold">200/-</span></div>
              <div className="flex justify-between"><span>Ban Makkhan</span><span className="font-bold">30/-</span></div>
              <div className="flex justify-between"><span>Maggie</span><span className="font-bold text-[10px]">Half 50/Full 90</span></div>
              <div className="flex justify-between"><span>Pyaz Pakodi</span><span className="font-bold">80/-</span></div>
              <div className="flex justify-between"><span>Paneer Kakodi</span><span className="font-bold">120/-</span></div>
              <div className="flex justify-between"><span>Aalu Pakodi</span><span className="font-bold">80/-</span></div>
            </div>
          </div>

          {/* Paratha / Roti */}
          <div className="rounded-xl bg-white p-3">
            <div className="text-center font-black text-[#d97706] text-sm">Paratha / Roti</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span>Plain Paratha</span><span className="font-bold">20/-</span></div>
              <div className="flex justify-between"><span>Aalu Paratha</span><span className="font-bold">40/-</span></div>
              <div className="flex justify-between"><span>Paneer Paratha</span><span className="font-bold">90/-</span></div>
              <div className="flex justify-between"><span>Aalu Pyaz Paratha</span><span className="font-bold">50/-</span></div>
              <div className="flex justify-between"><span>Aalu gobhi Paratha</span><span className="font-bold">60/-</span></div>
              <div className="flex justify-between"><span>Lacha Parath with Butter</span><span className="font-bold">30/-</span></div>
              <div className="flex justify-between"><span>Tawa Roti</span><span className="font-bold">10/-</span></div>
              <div className="flex justify-between"><span>Tandoor Roti</span><span className="font-bold">15/-</span></div>
              <div className="flex justify-between"><span>Butter Roti</span><span className="font-bold">20/-</span></div>
            </div>
            <div className="mt-3 rounded-lg bg-[#fff7ed] p-2">
              <div className="text-center font-black text-[#d97706] text-xs">Burger</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Veg Burger</span><span className="font-bold">70/-</span></div>
                <div className="flex justify-between"><span>Chees Burger</span><span className="font-bold">60/-</span></div>
                <div className="flex justify-between"><span>Paneer Burger</span><span className="font-bold">80/-</span></div>
              </div>
            </div>
          </div>

          {/* Sandwich / Pizza / Chai */}
          <div className="rounded-xl bg-white p-3 space-y-3">
            <div>
              <div className="text-center font-black text-[#d97706] text-sm">Sandwich</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Veg Sandwich</span><span className="font-bold">60/-</span></div>
                <div className="flex justify-between"><span>Paneer Sandwich</span><span className="font-bold">80/-</span></div>
              </div>
            </div>
            <div>
              <div className="text-center font-black text-[#d97706] text-sm">Pizza</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Paneer Pizza</span><span className="font-bold">120/-</span></div>
                <div className="flex justify-between"><span>Chees Corn Pizza</span><span className="font-bold">150/-</span></div>
                <div className="flex justify-between"><span>Onion Vegies Pizza</span><span className="font-bold">110/-</span></div>
              </div>
            </div>
            <div>
              <div className="text-center font-black text-[#d97706] text-sm">Chai / Coffee</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Chai</span><span className="font-bold">10/- 15/-</span></div>
                <div className="flex justify-between"><span>Kulhad Chai</span><span className="font-bold">20/-</span></div>
                <div className="flex justify-between"><span>Coffee</span><span className="font-bold">30/-</span></div>
                <div className="flex justify-between"><span>Cold Coffee</span><span className="font-bold">90/-</span></div>
              </div>
            </div>
          </div>

          {/* Noodles / Thali */}
          <div className="rounded-xl bg-white p-3 space-y-3">
            <div>
              <div className="text-center font-black text-[#d97706] text-sm">Noodles</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Veg Noodles</span><span className="font-bold text-[10px]">50 / 100</span></div>
                <div className="flex justify-between"><span>Chilli Garlic Noodles</span><span className="font-bold text-[10px]">60 / 120</span></div>
              </div>
            </div>
            <div className="rounded-lg bg-[#fff7ed] p-2 text-center">
              <div className="font-black text-[#d97706] text-xs">Thali - Rs. 120/-</div>
              <div className="text-[11px] leading-tight">4 Roti + Mix Veg + Daal + Gravy Sabji + Jeera Rice + Salad</div>
            </div>
            <div className="rounded-lg bg-[#fff7ed] p-2 text-center">
              <div className="font-black text-[#d97706] text-xs">Special Thali - Rs. 190/-</div>
              <div className="text-[11px] leading-tight">Paneer Sabji / Mashroom / Daal Fry / Daal Makhi + Papad + 1 Lacha Paratha + 2 Tandoori Roti + Salad + Raita + 1 Rasgula</div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-xl bg-white p-3">
            <div className="text-center font-black text-[#d97706] text-sm">Momos</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span>Veg Momos</span><span className="font-bold text-[10px]">40 / 60</span></div>
              <div className="flex justify-between"><span>Paneer Momos</span><span className="font-bold text-[10px]">60 / 100</span></div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="rounded-xl bg-white p-3">
              <div className="text-center font-black text-[#d97706] text-sm">Fried Rice</div>
              <div className="text-center text-xs font-bold">50 / 90</div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="text-center font-black text-[#d97706] text-sm">Finger Chips</div>
              <div className="text-center text-xs font-bold">50 / 90</div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="text-center font-black text-[#d97706] text-sm">Paneer Chilli</div>
              <div className="text-center text-xs font-bold">90 / 150</div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="rounded-xl bg-white p-3">
              <div className="text-center font-black text-[#d97706] text-sm">Sweet Corn</div>
              <div className="text-center text-xs font-bold">60 / 100</div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="text-center font-black text-[#d97706] text-sm">Mashroom Chilli</div>
              <div className="text-center text-xs font-bold">70 / 120</div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-center font-black text-[#d97706] text-sm">Sabji</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span>Matar Panner</span><span className="font-bold">80/- 150/-</span></div>
              <div className="flex justify-between"><span>Shai Panner</span><span className="font-bold">80/- 150/-</span></div>
              <div className="flex justify-between"><span>Mix Veg</span><span className="font-bold">50/- 80/-</span></div>
              <div className="flex justify-between"><span>Aalu Zera</span><span className="font-bold">50/- 90/-</span></div>
              <div className="flex justify-between"><span>Aalu Gobhi</span><span className="font-bold">50/- 90/-</span></div>
              <div className="flex justify-between"><span>Aalu Matar</span><span className="font-bold">50/- 90/-</span></div>
              <div className="flex justify-between"><span>Chola</span><span className="font-bold">60/- 100/-</span></div>
              <div className="flex justify-between"><span>Rajma</span><span className="font-bold">60/- 100/-</span></div>
              <div className="flex justify-between"><span>Pav Bhaji</span><span className="font-bold">60/-</span></div>
            </div>
            <div className="mt-3">
              <div className="text-center font-black text-[#d97706] text-sm">Sweet</div>
              <div className="mt-1 space-y-1 text-xs">
                <div className="flex justify-between"><span>Kheer</span><span className="font-bold">80/-</span></div>
                <div className="flex justify-between"><span>Gulab Jamun</span><span className="font-bold">25/-</span></div>
                <div className="flex justify-between"><span>Raita</span><span className="font-bold">60/- 100/-</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Chaap / Chinese / Momos / Main Course - Cream menu */}
        <div className="mt-4 rounded-xl bg-[#fff7ed] p-3">
          <div className="text-center font-display text-lg font-black text-[#7c2d12]">APNA BAITHAK SPECIAL • CHAAP • MOMOS • CHINESE • MAIN COURSE</div>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-white p-3">
              <div className="font-black text-[#d97706] text-center">ROSTED CHAAP (Half / Full)</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span>Malai Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Chatpata Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Afghani Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>K.F.C. Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Achari Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Nagin Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Lajpati Nagin</span><Price half={160} full={310} /></div>
                <div className="flex justify-between"><span>Amritsari Chaap</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Paneer Tikka Chaap</span><Price half={180} full={350} /></div>
                <div className="flex justify-between"><span>Chilli Chaap</span><Price half={150} full={290} /></div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="font-black text-[#d97706] text-center">MOMOS & BURGERS</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span>Steam Momos (6 Pc)</span><Price single={80} /></div>
                <div className="flex justify-between"><span>Fried Momos</span><Price single={90} /></div>
                <div className="flex justify-between"><span>Paneer Momos Steam</span><Price single={100} /></div>
                <div className="flex justify-between"><span>Tandoori Momos</span><Price single={150} /></div>
                <div className="flex justify-between"><span>Afghani Momos</span><Price single={160} /></div>
                <div className="flex justify-between"><span>Kurkure Momos</span><Price single={160} /></div>
                <div className="flex justify-between"><span>Achari Momos</span><Price single={180} /></div>
                <div className="pt-2 border-t font-bold">Burgers:</div>
                <div className="flex justify-between"><span>Veg Burger</span><Price single={79} /></div>
                <div className="flex justify-between"><span>Paneer Burger</span><Price single={119} /></div>
              </div>
            </div>
            <div className="rounded-xl bg-white p-3">
              <div className="font-black text-[#d97706] text-center">CHINESE & MAIN COURSE</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span>Schezwan Noodles</span><Price half={120} full={230} /></div>
                <div className="flex justify-between"><span>Hakka Noodles</span><Price half={120} full={230} /></div>
                <div className="flex justify-between"><span>Chilli Paneer</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Chilli Potato</span><Price half={120} full={230} /></div>
                <div className="flex justify-between"><span>Paneer Butter Masala</span><Price half={180} full={350} /></div>
                <div className="flex justify-between"><span>Kadai Paneer</span><Price half={150} full={290} /></div>
                <div className="flex justify-between"><span>Chaap Rolls</span><Price single={160} /></div>
                <div className="flex justify-between"><span>Cold Coffee</span><Price single={89} /></div>
                <div className="flex justify-between"><span>Roti / Naan</span><span>15-35/-</span></div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center text-xs font-bold text-[#7c2d12]">For full detailed menu with images, visit apnabaithak.com/menu or WhatsApp {SITE.phoneDisplay} / {SITE.phoneDisplaySecondary} • Pure Veg • Fresh Taste</div>
        </div>

        <div className="mt-3 flex justify-center gap-2 print:hidden">
          <Link href="/" className="rounded-full bg-white px-6 py-2 text-sm font-bold text-[#7c2d12]">← Back to Home</Link>
          <PrintButton className="rounded-full bg-[#1c0a00] px-6 py-2 text-sm font-bold text-white">Print / Save as PDF</PrintButton>
        </div>
      </div>
    </div>
  );
}
