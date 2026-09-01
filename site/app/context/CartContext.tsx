"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  variant?: string; // "half" | "full" | undefined
  isAvailable?: boolean;
  menuPrice?: number; // current price from menu for unavailable check
  menuHalf?: number;
  menuFull?: number;
};

export type DeliveryType = "delivery" | "takeaway" | "dinein";

export type OfferType = "flat" | "freeItem" | "bulk";

export type OfferDef = {
  id: string;
  label: string;
  type: OfferType;
  minOrder: number;
  value: number;
  freeItemValue?: number;
  desc: string;
  priority: number;
};

export const AVAILABLE_OFFERS: OfferDef[] = [
  { 
    id: "flat75", 
    label: "₹75 OFF", 
    type: "flat", 
    minOrder: 499, 
    value: 75, 
    desc: "₹75 off on orders above ₹499", 
    priority: 1 
  },
  { 
    id: "flat150", 
    label: "₹150 OFF", 
    type: "flat", 
    minOrder: 999, 
    value: 150, 
    desc: "₹150 off on orders above ₹999", 
    priority: 2 
  },
  { 
    id: "freeItem200", 
    label: "FREE ITEM ₹200", 
    type: "freeItem", 
    minOrder: 1500, 
    value: 200, 
    freeItemValue: 200,
    desc: "Order ₹1500+ and get any item worth ₹200 free", 
    priority: 3 
  },
  { 
    id: "freeItem250", 
    label: "FREE ITEM ₹250", 
    type: "freeItem", 
    minOrder: 2000, 
    value: 250, 
    freeItemValue: 250,
    desc: "Order ₹2000+ and get any item worth ₹250 free", 
    priority: 4 
  },
  { 
    id: "bulkOffer", 
    label: "BULK OFFER", 
    type: "bulk", 
    minOrder: 3000, 
    value: 0, 
    desc: "Special bulk order pricing - contact us for custom quote", 
    priority: 5 
  },
];

export const FREE_DELIVERY_THRESHOLD = 399;
export const BASE_DELIVERY_FEE = 40;
export const HANDLING_FEE = 5;
export const SMALL_CART_FEE = 30;
export const SMALL_CART_THRESHOLD = 149;

export type SelectedOffer = {
  id: string;
  label: string;
  type: OfferType;
  discount: number;
  freeItemValue?: number;
  desc: string;
} | null;

export type CartBill = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  handlingFee: number;
  smallCartFee: number;
  tip: number;
  grandTotal: number;
  savings: number;
  freeDeliveryProgress: number;
  freeDeliveryRemaining: number;
  isFreeDelivery: boolean;
  appliedOffer: SelectedOffer;
  eligibleOffers: OfferDef[];
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  clearCart: () => void;
  setTip: (n: number) => void;
  tip: number;
  deliveryType: DeliveryType;
  setDeliveryType: (t: DeliveryType) => void;
  selectedOffer: SelectedOffer;
  setSelectedOffer: (offer: SelectedOffer) => void;
  eligibleOffers: OfferDef[];
  total: number;
  subtotal: number;
  count: number;
  bill: CartBill;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  refreshCartImages: () => Promise<void>;
  unavailableItems: CartItem[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calcOfferDiscount(offer: OfferDef | null, subtotal: number): { discount: number; freeItemValue?: number } {
  if (!offer) return { discount: 0 };
  if (subtotal < offer.minOrder) return { discount: 0 };
  if (offer.type === "flat") return { discount: Math.min(offer.value, subtotal) };
  if (offer.type === "freeItem") return { discount: 0, freeItemValue: offer.freeItemValue };
  if (offer.type === "bulk") return { discount: 0 };
  return { discount: 0 };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem("apna-baithak-cart");
      if (saved) setCart(JSON.parse(saved));
      const savedTip = localStorage.getItem("apna-baithak-tip");
      if (savedTip) setTip(Number(savedTip) || 0);
      const savedDel = localStorage.getItem("apna-baithak-delivery") as DeliveryType | null;
      if (savedDel) setDeliveryType(savedDel);
      const savedOffer = localStorage.getItem("apna-baithak-offer");
      if (savedOffer) setSelectedOfferId(savedOffer);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("apna-baithak-cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem("apna-baithak-tip", String(tip));
    } catch {}
  }, [tip]);
  useEffect(() => {
    try {
      localStorage.setItem("apna-baithak-delivery", deliveryType);
    } catch {}
  }, [deliveryType]);
  useEffect(() => {
    try {
      if (selectedOfferId) localStorage.setItem("apna-baithak-offer", selectedOfferId);
      else localStorage.removeItem("apna-baithak-offer");
    } catch {}
  }, [selectedOfferId]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((p) => p.id !== id));
  const increase = (id: string) => setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  const decrease = (id: string) =>
    setCart((prev) => {
      const item = prev.find((p) => p.id === id);
      if (!item) return prev;
      if (item.quantity <= 1) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p));
    });

  const clearCart = () => {
    setCart([]);
    setTip(0);
    setSelectedOfferId(null);
    try {
      localStorage.removeItem("apna-baithak-cart");
      localStorage.removeItem("apna-baithak-tip");
      localStorage.removeItem("apna-baithak-offer");
    } catch {}
  };

  // Refresh cart images and availability from menu API
  const refreshCartImages = async () => {
    try {
      const r = await fetch("/api/menu", { cache: "no-store" });
      const d = await r.json();
      const allItems = d.allItems || d.categories?.flatMap((c: any) => c.items) || [];
      const itemMap = new Map<string, { image?: string; isAvailable?: boolean; price?: number; half?: number; full?: number }>(
        allItems.map((it: any) => [it.id, { image: it.image, isAvailable: it.isAvailable, price: it.price, half: it.half, full: it.full }])
      );
      
      setCart((prev) => prev.map((item) => {
        const menuItem = itemMap.get(item.id);
        if (!menuItem) return item;
        return {
          ...item,
          image: menuItem.image,
          isAvailable: menuItem.isAvailable !== false,
          menuPrice: menuItem.price,
          menuHalf: menuItem.half,
          menuFull: menuItem.full,
        };
      }));
    } catch (e) {
      console.error("Failed to refresh cart images:", e);
    }
  };

  // Check for unavailable items in cart
  const unavailableItems = useMemo(() => {
    return cart.filter((item) => item.isAvailable === false);
  }, [cart]);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const count = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const selectedOffer = useMemo(() => {
    if (!selectedOfferId) return null;
    const offer = AVAILABLE_OFFERS.find((o) => o.id === selectedOfferId);
    if (!offer) return null;
    const { discount, freeItemValue } = calcOfferDiscount(offer, subtotal);
    if (discount === 0 && !offer.freeItemValue) return null;
    return {
      id: offer.id,
      label: offer.label,
      type: offer.type,
      discount,
      freeItemValue: offer.freeItemValue,
      desc: offer.desc,
    };
  }, [selectedOfferId, subtotal]);

  const eligibleOffers = useMemo(() => {
    return AVAILABLE_OFFERS.filter((o) => subtotal >= o.minOrder);
  }, [subtotal]);

  const { discount, freeItemValue } = useMemo(() => {
    if (!selectedOffer) return { discount: 0, freeItemValue: undefined };
    return calcOfferDiscount(
      AVAILABLE_OFFERS.find((o) => o.id === selectedOffer.id) || null, 
      subtotal
    );
  }, [selectedOffer, subtotal]);

  const bill: CartBill = useMemo(() => {
    const isFreeByThreshold = subtotal >= FREE_DELIVERY_THRESHOLD;
    const isFreeDelivery = deliveryType !== "delivery" ? true : isFreeByThreshold;
    let deliveryFee = 0;
    if (deliveryType === "delivery") {
      if (isFreeDelivery) deliveryFee = 0;
      else if (subtotal >= 250) deliveryFee = 20;
      else if (subtotal > 0) deliveryFee = BASE_DELIVERY_FEE;
      else deliveryFee = 0;
    }
    const handlingFee = cart.length > 0 ? HANDLING_FEE : 0;
    const smallCartFee = deliveryType === "delivery" && subtotal > 0 && subtotal < SMALL_CART_THRESHOLD ? SMALL_CART_FEE : 0;
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee + handlingFee + smallCartFee + tip);
    const savedDelivery = deliveryType === "delivery" && isFreeDelivery && subtotal > 0 ? BASE_DELIVERY_FEE : 0;
    const savings = discount + savedDelivery + (selectedOffer?.freeItemValue || 0);
    const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
    const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    
    const eligible = AVAILABLE_OFFERS.filter((o) => subtotal >= o.minOrder);
    
    return {
      subtotal,
      discount,
      deliveryFee,
      handlingFee,
      smallCartFee,
      tip,
      grandTotal,
      savings,
      freeDeliveryProgress: progress,
      freeDeliveryRemaining: remaining,
      isFreeDelivery,
      appliedOffer: selectedOffer,
      eligibleOffers: eligible,
    };
  }, [subtotal, discount, tip, cart.length, deliveryType, selectedOffer]);

  const total = bill.grandTotal;

  const setSelectedOffer = (offer: { id: string; label: string; type: OfferType; discount: number; freeItemValue?: number; desc: string } | null) => {
    if (!offer) {
      setSelectedOfferId(null);
      return;
    }
    // Check if subtotal qualifies for this offer
    const offerDef = AVAILABLE_OFFERS.find((o) => o.id === offer.id);
    if (offerDef && subtotal >= offerDef.minOrder) {
      setSelectedOfferId(offer.id);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increase,
        decrease,
        clearCart,
        tip,
        setTip,
        deliveryType,
        setDeliveryType,
        selectedOffer,
        setSelectedOffer,
        eligibleOffers,
        total,
        subtotal,
        count,
        bill,
        isCartOpen,
        openCart,
        closeCart,
        refreshCartImages,
        unavailableItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}