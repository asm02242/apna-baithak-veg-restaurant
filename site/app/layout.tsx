import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { DetailProvider } from "./context/DetailContext";
import { WishlistProvider } from "./context/WishlistContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apnabaithak.vercel.app"),
  title: "APNA BAITHAK — Pure Veg Restaurant | Eldeco City, Lucknow",
  description:
    "Apna Baithak Pure Vegetarian Restaurant — North Indian, Chinese, Chaap, Momos, Rolls, Main Course & more. Fresh taste, family-friendly. Order on 9454999442.",
  icons: {
    icon: "/logo-neon.svg",
    shortcut: "/logo-neon.svg",
    apple: "/logo-neon.svg",
  },
};

export const viewport = {
  themeColor: "#ea580c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#fff7ed] font-sans antialiased">
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              <DetailProvider>{children}</DetailProvider>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
