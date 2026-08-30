import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-[#1c0a00] text-[#ffedd5]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-extrabold text-white">APNA BAITHAK</div>
            <div className="text-sm text-[#fed7aa]">Pure Veg. • Fresh Taste • Apna Baithak</div>
            <p className="mt-3 text-sm leading-6 text-[#ffedd5]/80">Pure vegetarian family restaurant serving Chaap, Momos, Chinese, Rolls & Main Course. Freshly prepared daily.</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#16a34a]/20 px-3 py-1 text-xs font-bold text-[#86efac]">● 100% Pure Veg</div>
          </div>
          <div>
            <div className="font-semibold text-white">Quick Links</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#menu" className="hover:text-white">Menu</a>
              <a href="#about" className="hover:text-white">About</a>
              <a href="#gallery" className="hover:text-white">Gallery</a>
              <a href="#contact" className="hover:text-white">Contact</a>
              <a href={`tel:${SITE.phone}`} className="hover:text-white">Call Now</a>
              <a href={`tel:${SITE.phoneSecondary}`} className="hover:text-white">Call Now</a>
            </div>
          </div>
          <div>
            <div className="font-semibold text-white">Contact</div>
            <p className="mt-3 text-sm text-[#ffedd5]/80">{SITE.fullAddress}</p>
            <p className="mt-2 text-sm"><a href={`tel:${SITE.phone}`} className="font-bold text-white hover:underline">{SITE.phoneDisplay}</a> • <a href={`tel:${SITE.phoneSecondary}`} className="font-bold text-white hover:underline">{SITE.phoneDisplaySecondary}</a> • {SITE.hours}</p>
            <p className="mt-1 text-xs text-[#fed7aa]">Bulk Order • Home Delivery • Tiffin Service</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#ffedd5]/60">
          <span>© {new Date().getFullYear()} Apna Baithak. All rights reserved.</span>
          <span>Made with ♥ in Lucknow • Pure Veg</span>
        </div>
        <div className="mt-3 flex justify-end">
          <a href="/admin/login" aria-label="Admin Login" title="Admin Login" className="select-none rounded-full px-2 py-1 text-[10px] font-bold tracking-widest text-white/15 hover:text-white/80 hover:bg-white/10 transition opacity-60 hover:opacity-100">
            •
          </a>
        </div>
      </div>
    </footer>
  );
}
