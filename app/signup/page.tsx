"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) return setErr("All fields required");
    const p = phone.trim().replace(/\D/g, '');
    if (p.length < 10) return setErr("Enter valid 10-digit phone number");
    const res = signup({ name, email, password, phone });
    if (!res.ok) return setErr(res.msg!);
    setOk("Account created! Redirecting…");
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <div className="min-h-screen bg-[#fff7ed] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-[#1c0a00] text-white p-10">
        <div>
          <div className="h-10 w-10 rounded-xl bg-[#ea580c] grid place-items-center font-black">AB</div>
          <h1 className="mt-6 font-display text-4xl font-black">APNA BAITHAK</h1>
          <p className="mt-2 text-white/70 text-sm">Pure Veg • Save favourites, wishlist & addresses for faster checkout.</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="text-sm font-bold">Why create account?</div>
          <ul className="mt-2 text-xs text-white/80 space-y-1">
            <li>• Save wishlist & favourites per user</li>
            <li>• Save multiple delivery addresses</li>
            <li>• Faster checkout & order history</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handle} className="w-full max-w-[420px] rounded-[24px] bg-white p-6 sm:p-8 shadow ring-1 ring-black/5">
          <h2 className="font-display text-2xl font-black">Create account</h2>
          <p className="text-xs text-black/60 mt-1">Save wishlist, favourites & addresses — per user, securely in your browser.</p>
          {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600">{err}</div>}
          {ok && <div className="mt-3 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs font-bold text-green-700">{ok}</div>}
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-black">Full name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
            <div>
              <label className="text-xs font-black">Email *</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
            <div>
              <label className="text-xs font-black">Phone *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" required />
            </div>
            <div>
              <label className="text-xs font-black">Password * (6+ chars)</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
            <button type="submit" className="w-full rounded-full bg-[#ea580c] py-3 text-sm font-black text-white hover:bg-[#c2410c] mt-2">Sign Up →</button>
            <div className="text-center text-xs">Have account? <Link href="/login" className="font-bold text-[#ea580c]">Login</Link></div>
            <div className="text-center text-[11px] text-black/40">Demo auth — stored locally in browser. No server needed.</div>
          </div>
        </form>
      </div>
    </div>
  );
}
