import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import FoodDetailPanel from "./components/FoodDetailPanel";
import FloatingButtons from "./components/FloatingButtons";
import BottomNav from "./components/BottomNav";
import LogoSplash from "./components/LogoSplash";

import HeroPremium from "./components/home/HeroPremium";
import QuickCategories from "./components/home/QuickCategories";
import OffersStrip from "./components/home/OffersStrip";
import CombosHome from "./components/home/CombosHome";
import BestSellersHome from "./components/home/BestSellersHome";
import WhyApnaBaithak from "./components/home/WhyApnaBaithak";
import FoodShowcase from "./components/home/FoodShowcase";
import GalleryPreview from "./components/home/GalleryPreview";
import LocationContact from "./components/home/LocationContact";
import FinalCTA from "./components/home/FinalCTA";

export default function Home() {
  return (
    <>
      <LogoSplash />
      <Header />
      {/* A - Hero */}
      <HeroPremium />
      {/* B - Quick Categories */}
      <QuickCategories />
      {/* C - Offers */}
      <OffersStrip />
      {/* D - Combos */}
      <CombosHome />
      {/* E - Best Sellers (6-8 items only, NOT all 89) */}
      <BestSellersHome />
      {/* F - Why Us */}
      <WhyApnaBaithak />
      {/* G - Food Showcase */}
      <FoodShowcase />
      {/* H - Gallery preview */}
      <GalleryPreview />
      {/* I - Location & Contact */}
      <LocationContact />
      {/* J - Final CTA */}
      <FinalCTA />
      {/* K - Footer */}
      <Footer />
      <CartDrawer />
      <FoodDetailPanel />
      <FloatingButtons />
      <BottomNav />
    </>
  );
}
