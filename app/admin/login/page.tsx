'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7ed] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] rounded-[24px] bg-white p-8 shadow-lg ring-1 ring-black/5">
        <div className="text-center mb-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-[#ea580c] text-white font-black text-2xl">AB</div>
          <h1 className="mt-4 font-display text-2xl font-black">Admin Panel</h1>
          <p className="mt-1 text-sm text-black/60">APNA BAITHAK Restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="asm2242"
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="asm.2242"
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ea580c]/20"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#ea580c] py-3 text-sm font-black text-white hover:bg-[#c2410c] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-black/40">
          Protected admin access • Attempts are rate-limited
        </div>
      </div>
    </div>
  );
}