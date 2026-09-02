"use client";
import { useDetail } from "../context/DetailContext";
import { useCart } from "../context/CartContext";

const mockReviews = [
  { name: "Aman S.", rating: 5, text: "Taste is amazing, delivery on time. Will order again!", ago: "2 days ago" },
  { name: "Priya K.", rating: 4, text: "Very fresh & hot. Packaging could be better but flavour top.", ago: "1 week ago" },
  { name: "Rohit M.", rating: 5, text: "Best chaap in Eldeco. Pure veg & super tasty.", ago: "3 days ago" },
];

export default function FoodDetailPanel() {
  const { item, isOpen, closeDetail, openDetail } = useDetail();
  const { cart, addToCart, increase, decrease } = useCart();

  if (!isOpen || !item) return null;

  const hasVariant = item.half !== undefined && item.full !== undefined && item.half > 0 && item.full > 0;
  const halfId = `${item.id}-half`;
  const fullId = `${item.id}-full`;
  const halfInCart = cart.find((c) => c.id === halfId);
  const fullInCart = cart.find((c) => c.id === fullId);
  const singleInCart = cart.find((c) => c.id === item.id);
  const related = []; // Will be populated from API if needed

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={closeDetail} className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="absolute left-0 top-0 h-full w-full sm:w-[420px] bg-[#f7f7f7] shadow-[16px_0_48px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden">
        {/* Header with close on right */}
        <div className="bg-white border-b px-3 py-2 flex items-center justify-between">
          <div className="text-xs font-black tracking-wide text-[#1c0a00]">DETAILS • {item.category.toUpperCase()}</div>
          <button onClick={closeDetail} aria-label="Close detail" className="inline-flex items-center gap-1 rounded-full bg-[#1c0a00] px-3 py-1.5 text-[10px] font-black text-white hover:bg-black border border-white/10 shadow">Close <span className="text-xs">✕</span></button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Image */}
          <div className="relative h-[220px] bg-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${item.image}?v=${Date.now()}`} alt={item.name} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-black shadow">
              <span className="h-3 w-3 rounded-[3px] border border-[#16a34a] grid place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" /></span> PURE VEG
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-[#1c0a00] px-2 py-1 text-[11px] font-bold text-white">★ {item.rating.toFixed(1)}</span>
          </div>

          <div className="p-3 space-y-3">
            {/* Title + rating + price */}
            <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
              <div className="text-xs font-bold tracking-[0.08em] text-[#ea580c]">{item.category}</div>
              <div className="text-[18px] font-black leading-tight text-[#1c0a00]">{item.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[#16a34a] px-2 py-1 text-[10px] font-black text-white">★ {item.rating} • Pure Veg</span>
                <span className="text-black/50">{mockReviews.length} reviews • 90+ orders</span>
              </div>
              <div className="mt-3">
                {hasVariant && item.half && item.full ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border bg-[#fff7ed] p-2">
                      <div className="text-center text-[11px] font-bold">Half</div>
                      <div className="text-center text-sm font-black text-[#ea580c]">₹{item.half}</div>
                      {!halfInCart ? (
                        <button onClick={() => addToCart({ id: halfId, name: `${item.name} (Half)`, price: item.half!, category: item.category, image: item.image })} className="mt-1 w-full rounded-full bg-white border border-[#ea580c] py-1.5 text-xs font-black text-[#ea580c] hover:bg-[#ea580c] hover:text-white">Add Half +</button>
                      ) : (
                        <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                          <button onClick={() => decrease(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/20">−</button>
                          <span className="text-xs font-bold">{halfInCart.quantity}</span>
                          <button onClick={() => increase(halfId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border bg-white p-2">
                      <div className="text-center text-[11px] font-bold">Full</div>
                      <div className="text-center text-sm font-black text-[#ea580c]">₹{item.full}</div>
                      {!fullInCart ? (
                        <button onClick={() => addToCart({ id: fullId, name: `${item.name} (Full)`, price: item.full!, category: item.category, image: item.image })} className="mt-1 w-full rounded-full bg-[#ea580c] py-1.5 text-xs font-bold text-white">Add Full +</button>
                      ) : (
                        <div className="mt-1 flex items-center justify-between rounded-full bg-[#ea580c] px-1 py-1 text-white">
                          <button onClick={() => decrease(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/20">−</button>
                          <span className="text-xs font-bold">{fullInCart.quantity}</span>
                          <button onClick={() => increase(fullId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-black text-[#1c0a00]">₹{item.price}</div>
                    {!singleInCart ? (
                      <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, category: item.category, image: item.image })} className="rounded-full bg-[#ea580c] px-5 py-2 text-xs font-black text-white hover:bg-[#c2410c]">Add to Cart +</button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-[#ea580c] p-1 text-white">
                        <button onClick={() => decrease(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white/20">−</button>
                        <span className="min-w-[28px] text-center text-sm font-bold">{singleInCart.quantity}</span>
                        <button onClick={() => increase(item.id)} className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#ea580c]">+</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 text-[11px] text-black/60">Inclusive of taxes • Freshly prepared • 25-32 mins delivery</div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
              <div className="text-xs font-black">Description</div>
              <p className="mt-1 text-xs leading-5 text-black/70">{item.description || "Signature dish from our kitchen — pure veg, generous portion, freshly prepared."}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#fff7ed] px-2 py-1 text-[10px] font-bold">Pure Veg</span>
                <span className="rounded-full bg-[#fff7ed] px-2 py-1 text-[10px] font-bold">Fresh</span>
                <span className="rounded-full bg-[#fff7ed] px-2 py-1 text-[10px] font-bold">{item.category}</span>
                <span className="rounded-full bg-white border px-2 py-1 text-[10px] font-bold">★ {item.rating}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Reviews • {mockReviews.length} • ★ {item.rating.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-[#ea580c]">View all</span>
              </div>
              <div className="mt-2 space-y-2">
                {mockReviews.map((r, i) => (
                  <div key={i} className="rounded-xl bg-[#f7f7f7] p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1c0a00] text-white text-xs font-bold">{r.name[0]}</span>
                      <div className="flex-1">
                        <div className="text-xs font-bold leading-none">{r.name} <span className="ml-1 rounded bg-[#16a34a] px-1 py-0.5 text-[10px] text-white">★ {r.rating}</span></div>
                        <div className="text-[10px] text-black/50">{r.ago} • Verified order</div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs leading-4 text-black/70">{r.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
              <div className="text-xs font-black">Related items • {item.category}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {related.map((it) => {
                  const hasVariant = it.half !== undefined && it.full !== undefined && it.half > 0 && it.full > 0;
                  return (
                    <button key={it.id} onClick={() => openDetail(it)} className="text-left rounded-xl border bg-white p-2 hover:bg-[#fff7ed]">
                      <img src={`${it.image}?v=${Date.now()}`} alt={it.name} className="h-20 w-full object-cover rounded-lg" />
                      <div className="mt-1 line-clamp-1 text-xs font-bold">{it.name}</div>
                      <div className="text-xs font-black text-[#ea580c]">
                        {hasVariant ? `Half ₹${it.half} • Full ₹${it.full}` : `₹${it.price}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
