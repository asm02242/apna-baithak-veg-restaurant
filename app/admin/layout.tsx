'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check' }),
        });
        const data = await res.json();
        setAuthenticated(data.authenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7ed] flex items-center justify-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] animate-spin">⏳</div>
      </div>
    );
  }

  if (!authenticated) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-black text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ea580c] text-white">AB</span>
            Admin Panel
          </Link>
          <form action="/api/admin/auth" method="POST" className="inline">
            <input type="hidden" name="action" value="logout" />
            <button type="submit" className="rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-black text-white hover:bg-[#c2410c]">Logout</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        {children}
      </div>
    </div>
  );
}