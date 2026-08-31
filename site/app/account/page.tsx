"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { SITE } from "@/lib/site";

type Tab = "profile" | "orders" | "addresses" | "wishlist" | "coupons" | "notifications" | "settings";

export default function AccountPage() {
  const { user, logout, addAddress, removeAddress } = useAuth();
  const { ids: wishlistIds, count: wishCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [tab, setTab] = useState<Tab>("profile");
  const [mounted, setMounted] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("Home");
  const [newAddrFull, setNewAddrFull] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addrMsg, setAddrMsg] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    fetch("/api/coupons", { cache: "no-store" }).then((r) => r.json()).then((d) => setCoupons(d.coupons || [])).catch(() => {});
  }, []);
  useEffect(() => {
    if (tab !== "orders") return;
    setOrdersLoading(true);
    fetch("/api/orders", { cache: "no-store" }).then(async (r) => {
      if (!r.ok) throw new Error("not auth");
      const d = await r.json();
      setOrders(d.orders || []);
    }).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
  }, [tab]);

  const handleAddAddress = () => {
    if (!newAddrFull.trim()) { setAddrMsg("Enter address"); return; }
    addAddress({ label: newAddrLabel, full: newAddrFull.trim() });
    setNewAddrFull("");
    setAddrMsg("Address saved");
    setTimeout(() => setAddrMsg(""), 2000);
  };

  const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
    { id: "profile", label: "Profile", icon: "👤", desc: "Personal info" },
    { id: "orders", label: "My Orders", icon: "🧾", desc: "Track orders" },
    { id: "addresses", label: "Addresses", icon: "📍", desc: "Saved places" },
    { id: "wishlist", label: "Wishlist", icon: "♥", desc: `${wishCount} items` },
    { id: "coupons", label: "Coupons", icon: "🏷️", desc: "Offers" },
    { id: "notifications", label: "Notifications", icon: "🔔", desc: "Updates" },
    { id: "settings", label: "Settings", icon: "⚙️", desc: "Preferences" },
  ];

  if (!mounted) return <div className="min-h-screen bg-[#fff7ed] grid place-items-center"><div className="h-10 w-10 rounded-full border-4 border-[#ea580c]/20 border-t-[#ea580c] animate-spin" /></div>;

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#fff7ed]">
          <div className="mx-auto max-w-[720px] px-4 py-10">
            <div className="rounded-[28px] bg-white p-8 sm:p-10 text-center ring-1 ring-black/5 shadow-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] text-3xl">🔒</div>
              <h1 className="mt-4 text-2xl font-black">Please login</h1>
              <p className="mt-2 text-sm text-black/60">Access your profile, orders, addresses, wishlist and more. We use Neon-auth — your data is safe.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/login" className="rounded-full bg-[#ea580c] px-6 py-3 text-sm font-black text-white">Login</Link>
                <Link href="/signup" className="rounded-full border bg-white px-6 py-3 text-sm font-black">Create account</Link>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-left">
                {[
                  { t: "Secure", d: "Password hashing + session cookies" },
                  { t: "Fast", d: "One-tap checkout with saved address" },
                  { t: "Rewarding", d: "Coupons & wishlist sync" },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl bg-[#fff7ed] p-3 border border-black/5">
                    <div className="text-xs font-black">{x.t}</div>
                    <div className="text-xs text-black/60">{x.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff7ed]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
          {/* Top card */}
          <div className="rounded-[28px] bg-[#1c0a00] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ea580c] text-xl font-black">{user.name[0]?.toUpperCase()}</span>
              <div>
                <div className="text-xl font-black">{user.name}</div>
                <div className="text-sm text-white/70">{user.email} {user.phone ? `• ${user.phone}` : ""}</div>
                <div className="mt-1 flex gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{wishCount} wishlist</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">{user.addresses.length} addresses</span>
                  <span className="hidden sm:inline-flex rounded-full bg-[#16a34a] px-2.5 py-1 text-xs font-black">● Verified</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/cart" className="rounded-full bg-white text-[#1c0a00] px-5 py-2.5 text-xs font-black">Cart • {cartCount}</Link>
              <button onClick={logout} className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-black hover:bg-white/10">Logout</button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <div className="rounded-[24px] bg-white p-3 ring-1 ring-black/5 shadow-sm h-fit lg:sticky lg:top-[78px]">
              <div className="grid gap-1.5">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`text-left flex items-center gap-3 rounded-2xl px-4 py-3 transition ${tab === t.id ? "bg-[#1c0a00] text-white shadow" : "hover:bg-[#fff7ed] border border-transparent hover:border-black/5"}`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-xl text-sm ${tab === t.id ? "bg-white text-[#1c0a00]" : "bg-[#fff7ed] border border-black/5"}`}>{t.icon}</span>
                    <span><span className="block text-sm font-bold leading-none">{t.label}</span><span className={`text-xs ${tab === t.id ? "text-white/60" : "text-black/50"}`}>{t.desc}</span></span>
                    {tab === t.id && <span className="ml-auto text-sm">→</span>}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-2xl bg-[#fff7ed] border border-black/5 p-3">
                <div className="text-xs font-black">Need help?</div>
                <div className="text-xs text-black/60">Call {SITE.phoneDisplay} or WhatsApp us. Delivery in 32 mins.</div>
                <div className="mt-2 flex gap-2">
                  <a href={`tel:${SITE.phone}`} className="flex-1 rounded-full bg-[#1c0a00] py-2 text-center text-xs font-bold text-white">Call</a>
                  <a href={`https://wa.me/91${SITE.whatsapp}`} target="_blank" className="flex-1 rounded-full bg-[#16a34a] py-2 text-center text-xs font-bold text-white">WhatsApp</a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {tab === "profile" && (
                <div className="rounded-[24px] bg-white p-6 sm:p-8 ring-1 ring-black/5 shadow-sm">
                  <h2 className="text-lg font-black">Profile</h2>
                  <p className="text-sm text-black/60">Your account details synced via AuthContext. Edit coming soon — for now your data is used at checkout.</p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <div className="text-xs font-bold text-black/50">Full name</div>
                      <div className="text-sm font-black mt-1">{user.name}</div>
                    </div>
                    <div className="rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <div className="text-xs font-bold text-black/50">Email</div>
                      <div className="text-sm font-bold mt-1 break-all">{user.email}</div>
                    </div>
                    <div className="rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <div className="text-xs font-bold text-black/50">Phone</div>
                      <div className="text-sm font-black mt-1">{user.phone || "— not set"}</div>
                    </div>
                    <div className="rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <div className="text-xs font-bold text-black/50">User ID</div>
                      <div className="text-xs font-mono mt-1 break-all">{user.id}</div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Link href="/orders" className="rounded-full bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white">My Orders</Link>
                    <Link href="/wishlist" className="rounded-full border bg-white px-5 py-2.5 text-sm font-black">Wishlist</Link>
                    <button onClick={logout} className="rounded-full bg-[#1c0a00] px-5 py-2.5 text-sm font-bold text-white">Logout</button>
                  </div>
                </div>
              )}

              {tab === "orders" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black">My Orders</h2>
                    <Link href="/orders" className="rounded-full bg-[#fff7ed] border border-black/5 px-3 py-1.5 text-xs font-black">Open full page →</Link>
                  </div>
                  {ordersLoading ? (
                    <div className="mt-6 grid gap-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-[#fff7ed] shimmer" />)}</div>
                  ) : orders.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-[#fff7ed] border border-black/5 p-8 text-center">
                      <div className="text-3xl">🧾</div>
                      <div className="mt-2 font-black">No Neon orders yet</div>
                      <div className="text-sm text-black/60">Orders placed via secure checkout will appear here. For demo, local orders are stored after checkout.</div>
                      <Link href="/menu" className="mt-4 inline-flex rounded-full bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white">Order now</Link>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {orders.slice(0, 5).map((o: any) => (
                        <div key={o.id} className="rounded-2xl border border-black/5 p-4 bg-[#fff7ed]/40">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold">#{o.id}</span>
                            <span className={`rounded-full px-2 py-1 text-xs font-black border ${o.order_status === "DELIVERED" ? "bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]/20" : "bg-white border-black/10"}`}>{o.order_status}</span>
                          </div>
                          <div className="mt-1 text-xs text-black/60">{new Date(o.created_at).toLocaleString()} • {o.payment_method} • ₹{o.total}</div>
                          <div className="mt-2 text-xs font-semibold line-clamp-1">{(o.items || []).map((it: any) => `${it.name} x${it.quantity}`).join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "addresses" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <h2 className="text-lg font-black">Saved Addresses</h2>
                  <p className="text-sm text-black/60">Manage delivery addresses — used at checkout. Stored via AuthContext (local) and Neon addresses API when logged in.</p>
                  <div className="mt-4 grid gap-3">
                    {user.addresses.length === 0 ? <div className="rounded-2xl bg-[#fff7ed] border border-dashed px-4 py-6 text-center text-sm text-black/60">No addresses yet. Add one below.</div> : user.addresses.map((a) => (
                      <div key={a.id} className="flex items-start justify-between gap-3 rounded-2xl border border-black/5 bg-[#fff7ed] p-4">
                        <div>
                          <div className="inline-flex rounded-full bg-white border border-black/5 px-2 py-1 text-xs font-black">{a.label}</div>
                          <div className="mt-1 text-sm font-semibold leading-snug">{a.full}</div>
                        </div>
                        <button onClick={() => removeAddress(a.id)} className="shrink-0 rounded-full bg-white border border-black/10 px-3 py-1.5 text-xs font-bold hover:bg-[#fef2f2] hover:text-[#e11d48]">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-black/5 p-4 bg-[#fff7ed]/60">
                    <div className="text-sm font-black">Add new address</div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {["Home", "Work", "Other"].map((l) => (
                        <button key={l} onClick={() => setNewAddrLabel(l)} className={`rounded-full px-3 py-1.5 text-xs font-black border ${newAddrLabel === l ? "bg-[#1c0a00] text-white border-[#1c0a00]" : "bg-white border-black/10"}`}>{l}</button>
                      ))}
                    </div>
                    <textarea value={newAddrFull} onChange={(e) => setNewAddrFull(e.target.value)} placeholder="House / Flat / Street / Landmark, City — be as detailed as possible" rows={3} className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={handleAddAddress} className="rounded-full bg-[#ea580c] px-6 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">Save address</button>
                      {addrMsg && <span className="text-xs font-bold text-[#16a34a]">{addrMsg}</span>}
                    </div>
                  </div>
                </div>
              )}

              {tab === "wishlist" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black">Wishlist • {wishCount}</h2>
                    <Link href="/wishlist" className="rounded-full bg-[#ea580c] px-4 py-2 text-xs font-black text-white">View all →</Link>
                  </div>
                  <div className="mt-3 text-sm text-black/60">Items you loved. Quick add to cart from wishlist page.</div>
                  <Link href="/wishlist" className="mt-4 inline-flex rounded-full border bg-white px-5 py-2.5 text-sm font-black">Go to wishlist</Link>
                </div>
              )}

              {tab === "coupons" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <h2 className="text-lg font-black">Coupons & Offers</h2>
                  <div className="mt-3 flex gap-2">
                    <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 rounded-full border border-black/10 bg-[#fff7ed] px-4 py-3 text-sm font-bold outline-none" />
                    <button onClick={async () => { if(!couponInput.trim()) return; const r = await fetch("/api/coupons/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:couponInput.trim(),cartTotal:0})}); const d=await r.json(); alert(d.valid?`Valid • -₹${d.discount}`:d.error||"Invalid"); }} className="rounded-full bg-[#1c0a00] px-5 py-3 text-sm font-black text-white">Validate</button>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {coupons.length === 0 ? <div className="rounded-2xl bg-[#fff7ed] border border-dashed p-4 text-sm text-black/60 text-center">No active coupons in Neon. Contact admin to create coupons via admin/coupons.</div> : coupons.map((c) => (
                      <div key={c.code} className="rounded-2xl border border-[#f59e0b]/20 bg-[#fffbeb] p-4 flex items-start justify-between gap-3">
                        <div><div className="font-mono text-sm font-black">{c.code}</div><div className="text-sm font-bold">{c.title}</div><div className="text-xs text-black/60">{c.description}</div></div>
                        <button onClick={() => { setCouponInput(c.code); navigator.clipboard?.writeText(c.code); }} className="shrink-0 rounded-full bg-white border border-black/5 px-3 py-1.5 text-xs font-black">Copy</button>
                      </div>
                    ))}
                  </div>
                  <Link href="/offers" className="mt-4 inline-flex rounded-full bg-[#fff7ed] border border-black/5 px-5 py-2.5 text-sm font-black">View Offers page →</Link>
                </div>
              )}

              {tab === "notifications" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <h2 className="text-lg font-black">Notifications</h2>
                  <div className="mt-4 grid gap-2">
                    {[
                      { t: "Order confirmed", d: "Your chaap order is being prepared — 15 mins", time: "2m ago" },
                      { t: "Free delivery unlocked", d: "Add ₹120 more to get free delivery on next order", time: "1h ago" },
                      { t: "New offer", d: "₹75 OFF on orders above ₹499 — use code APNA75", time: "Yesterday" },
                    ].map((n) => (
                      <div key={n.t} className="rounded-2xl bg-[#fff7ed] border border-black/5 p-4 flex gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-black/5">🔔</span>
                        <div><div className="text-sm font-black">{n.t}</div><div className="text-xs text-black/60">{n.d}</div></div>
                        <span className="ml-auto text-xs text-black/40 shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "settings" && (
                <div className="rounded-[24px] bg-white p-6 ring-1 ring-black/5 shadow-sm">
                  <h2 className="text-lg font-black">Settings</h2>
                  <div className="mt-4 grid gap-3">
                    <label className="flex items-center justify-between rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <span className="text-sm font-bold">Pure Veg mode (always on)</span>
                      <span className="rounded-full bg-[#16a34a] px-3 py-1 text-xs font-black text-white">● ON</span>
                    </label>
                    <label className="flex items-center justify-between rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <span className="text-sm font-bold">Push notifications</span>
                      <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#ea580c]" />
                    </label>
                    <label className="flex items-center justify-between rounded-2xl bg-[#fff7ed] border border-black/5 p-4">
                      <span className="text-sm font-bold">Language</span>
                      <span className="rounded-full bg-white border border-black/5 px-3 py-1 text-xs font-bold">English • Hindi</span>
                    </label>
                    <div className="rounded-2xl bg-[#1c0a00] p-4 text-white">
                      <div className="text-sm font-black">Danger zone</div>
                      <div className="text-xs text-white/60">Logout will clear your session. Cart & wishlist remain locally.</div>
                      <button onClick={logout} className="mt-3 rounded-full bg-[#e11d48] px-5 py-2 text-sm font-black">Logout</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
