"use client";
import { useCart } from "../context/CartContext";
import { useDetail } from "../context/DetailContext";
import { useWishlist } from "../context/WishlistContext";
import type { MenuItem } from "@/data/menu";

const emojiMap: Record<string, string> = {
  chinese: "🍜",
  "roasted-chaap": "🍢",
  "chaap-rolls": "🌯",
  "main-course": "🍛",
  momos: "🥟",
  burgers: "🍔",
  beverages: "🥤",
  extras: "🫓",
};

function getImage(item: MenuItem) {
  if (item.image) return `${item.image}?v=${Date.now()}`;
  const n = item.name.toLowerCase();
  if (n.includes("paneer") || n.includes("shahi") || n.includes("rogan josh") || n.includes("kadai"))
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop";
  if (n.includes("chaap")) return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop";
  if (n.includes("noodle") || n.includes("fried rice") || n.includes("schezwan") || n.includes("hakka") || n.includes("singapuri"))
    return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop";
  if (n.includes("momo")) return "https://images.unsplash.com/photo-1534422298391-e4f640380802?w=400&h=300&fit=crop";
  if (n.includes("burger") || n.includes("sandwich")) return "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=300&fit=crop";
  if (n.includes("roll")) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop";
  if (n.includes("chilli paneer") || n.includes("chilli potato") || n.includes("honey"))
    return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop";
  if (n.includes("coffee") || n.includes("lassi") || n.includes("lime") || n.includes("soft drink") || n.includes("mineral"))
    return "https://images.unsplash.com/photo-1544148103-0828576b90a6?w=400&h=300&fit=crop";
  if (n.includes("roti") || n.includes("naan") || n.includes("kulcha") || n.includes("rice"))
    return "https://images.unsplash.com/photo-1626132647520-4d2887bf80e6?w=400&h=300&fit=crop";
  const catMap: Record<string, string> = {
    chinese: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
    "roasted-chaap": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    "chaap-rolls": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    "main-course": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    momos: "https://images.unsplash.com/photo-1534422298391-e4f640380802?w=400&h=300&fit=crop",
    burgers: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=300&fit=crop",
    beverages: "https://images.unsplash.com/photo-1544148103-0828576b90a6?w=400&h=300&fit=crop",
    extras: "https://images.unsplash.com/photo-1626132647520-4d2887bf80e6?w=400&h=300&fit=crop",
  };
  return catMap[item.categoryId] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";
}

export default function FoodCard({ item }: { item: MenuItem & { isAvailable?: boolean } }) {
  const { cart, addToCart, increase, decrease } = useCart();
  const { openDetail } = useDetail();
  const { toggle, isWishlisted } = useWishlist();
  const wish = isWishlisted(item.id);
  const inCart = (id: string) => cart.find((c) => c.id === id);

  const isAvailable = (item as any).isAvailable !== false;
  const hasVariant = item.half !== undefined && item.full !== undefined;
  const halfId = `${item.id}-half`;
  const fullId = `${item.id}-full`;
  const halfInCart = inCart(halfId);
  const fullInCart = inCart(fullId);
  const singleInCart = inCart(item.id);

  const img = getImage(item);
  return (
    <div className={`group flex flex-col rounded-[20px] bg-white p-3 shadow-[0_8px_24px_rgba(28,10,0,0.06)] ring-1 ring-black/[0.04] card-hover ${!isAvailable ? 'opacity-75' : ''}`}>
      <div onClick={() => openDetail(item)} className="relative overflow-hidden rounded-2xl cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={item.name} className={`h-[118px] w-full object-cover ${!isAvailable ? 'grayscale' : ''}`} loading="lazy" onError={(e) => ((e.currentTarget.style.display = "none"), ((e.currentTarget.nextElementSibling as HTMLElement).style.display = "grid"))} />
        <div className="hidden h-[118px] bg-gradient-to-br from-orange-50 via-amber-50 to-[#fff7ed] place-items-center text-[42px]">{emojiMap[item.categoryId] ?? "🍽️"}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(item.id);
          }}
          aria-label="Wishlist"
          className={`absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full shadow border backdrop-blur text-sm ${wish ? "bg-[#ea580c] text-white border-[#ea580c]" : "bg-white/90 text-black/60 border-white"}`}
        >
          {wish ? "♥" : "♡"}
        </button>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-extrabold tracking-wide shadow">
          <span className="h-3 w-3 rounded-[3px] border border-[#16a34a] grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /></span> VEG
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-[#1c0a00] px-2 py-1 text-[11px] font-bold text-white">★ {item.rating.toFixed(1)}</span>
        {!isAvailable && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-white backdrop-blur">Unavailable</span>}
      </div>

      <div onClick={() => openDetail(item)} className="flex-1 pt-3 cursor-pointer">
        <div className="text-[11px] font-bold tracking-[0.08em] text-[#ea580c]">{item.category}</div>
        <div className="line-clamp-1 text-[15px] font-extrabold leading-tight text-[#1c0a00] hover:text-[#ea580c]">{item.name}</div>
        {hasVariant ? (
          <div className="mt-1 text-xs text-black/60">Half ₹{item.half} • Full ₹{item.full}</div>
        ) : (
          <div className="mt-1 text-xs text-black/60">Fresh • Hot • Pure Veg</div>
        )}
      </div>

      <div className="mt-3">
        {!isAvailable ? (
          <div className="rounded-full bg-gray-100 py-2 text-center text-xs font-black text-black/50 border">Unavailable</div>
        ) : hasVariant ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border bg-[#fff7ed] p-1.5">
              <div className="text-center text-xs font-bold">Half</div>
              <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{item.half}</div>
              {!halfInCart ? (
                <button onClick={() => addToCart({ id: halfId, name: `${item.name} (Half)`, price: item.half!, category: item.category, image: img })} className="mt-1 w-full rounded-full bg-white border border-[#ea580c] py-1.5 text-xs font-black text-[#ea580c] hover:bg-[#ea580c] hover:text-white">Add +</button>
              ) : (
                <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                  <button onClick={() => decrease(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15">−</button>
                  <span className="text-xs font-bold">{halfInCart.quantity}</span>
                  <button onClick={() => increase(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                </div>
              )}
            </div>
            <div className="rounded-2xl border bg-white p-1.5">
              <div className="text-center text-xs font-bold">Full</div>
              <div className="text-center text-sm font-extrabold text-[#ea580c]">₹{item.full}</div>
              {!fullInCart ? (
                <button onClick={() => addToCart({ id: fullId, name: `${item.name} (Full)`, price: item.full!, category: item.category, image: img })} className="mt-1 w-full rounded-full bg-[#ea580c] py-1.5 text-xs font-bold text-white hover:bg-[#c2410c]">Add +</button>
              ) : (
                <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                  <button onClick={() => decrease(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15">−</button>
                  <span className="text-xs font-bold">{fullInCart.quantity}</span>
                  <button onClick={() => increase(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="text-[18px] font-black text-[#1c0a00]">₹{item.price}</div>
            {!singleInCart ? (
              <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, category: item.category, image: img })} className="rounded-full bg-[#ea580c] border border-[#ea580c] px-5 py-2 text-xs font-black text-white hover:bg-[#c2410c] shadow">Add +</button>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-[#ea580c] p-1 text-white">
                <button onClick={() => decrease(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/15">−</button>
                <span className="min-w-[28px] text-center text-sm font-bold">{singleInCart.quantity}</span>
                <button onClick={() => increase(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
