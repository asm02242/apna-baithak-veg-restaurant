"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loginWithPhone } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [mode, setMode] = useState<"email" | "phone">("email");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = mode === "phone" ? loginWithPhone(identifier, password) : login(identifier, password);
    if (!res.ok) return setErr(res.msg!);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#fff7ed] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white p-10">
        <div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#ea580c] grid place-items-center font-black">AB</div>
          <h1 className="mt-6 font-display text-4xl font-black">Welcome back</h1>
          <p className="mt-2 text-white/90 text-sm">Login to see your wishlist, favourites & saved addresses.</p>
        </div>
        <div className="rounded-2xl bg-white text-[#1c0a00] p-4">
          <div className="text-sm font-black">Your data stays with you</div>
          <div className="text-xs text-black/60">Wishlist & addresses are saved per user in this browser. Fast, private, no tracking.</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handle} className="w-full max-w-[420px] rounded-[24px] bg-white p-6 sm:p-8 shadow ring-1 ring-black/5">
          <h2 className="font-display text-2xl font-black">Login</h2>
          <p className="text-xs text-black/60 mt-1">Access your wishlist & saved addresses.</p>
          {err && <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-bold text-red-600">{err}</div>}
          
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => { setMode("email"); setErr(""); }} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "email" ? "bg-[#ea580c] text-white" : "bg-[#f7f7f7] text-black/60"}`}>Email</button>
            <button type="button" onClick={() => { setMode("phone"); setErr(""); }} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === "phone" ? "bg-[#ea580c] text-white" : "bg-[#f7f7f7] text-black/60"}`}>Phone</button>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-black">{mode === "phone" ? "Phone *" : "Email *"}</label>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={mode === "phone" ? "98xxxxxxxx" : "you@example.com"} type={mode === "phone" ? "tel" : "email"} className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
            <div>
              <label className="text-xs font-black">Password *</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20" />
            </div>
            <button type="submit" className="w-full rounded-full bg-[#1c0a00] py-3 text-sm font-black text-white hover:bg-black mt-2">Login →</button>
            <div className="text-center text-xs">No account? <Link href="/signup" className="font-bold text-[#ea580c]">Sign up</Link></div>
            <div className="text-center text-xs font-bold text-black/40">One account per phone number. {mode === "phone" ? "Login with phone + password." : "Login with email + password."}</div>
          </div>
        </form>
      </div>
    </div>
  );
}