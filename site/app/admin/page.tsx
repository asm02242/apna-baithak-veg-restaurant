'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalItems: number;
  totalCategories: number;
  activeOffers: number;
  pendingNews: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalItems: 0,
    totalCategories: 0,
    activeOffers: 0,
    pendingNews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, customersRes, menuRes, offersRes, newsRes] = await Promise.all([
          fetch('/api/admin/orders?limit=1'),
          fetch('/api/admin/customers'),
          fetch('/api/admin/menu'),
          fetch('/api/admin/offers'),
          fetch('/api/admin/news'),
        ]);

        const [ordersData, customersData, menuData, offersData, newsData] = await Promise.all([
          ordersRes.json(),
          customersRes.json(),
          menuRes.json(),
          offersRes.json(),
          newsData.json(),
        ]);

        setStats({
          totalOrders: ordersData.orders?.length || 0,
          pendingOrders: ordersData.orders?.filter((o: any) => o.status === 'pending').length || 0,
          totalRevenue: ordersData.orders?.reduce((sum: number, o: any) => sum + o.grandTotal, 0) || 0,
          totalCustomers: customersData.customers?.length || 0,
          totalItems: menuData.categories?.reduce((sum: number, c: any) => sum + c.items.length, 0) || 0,
          totalCategories: menuData.categories?.length || 0,
          activeOffers: offersData.offers?.filter((o: any) => o.active).length || 0,
          pendingNews: newsData.news?.filter((n: any) => n.active).length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-[#ea580c]' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-[#f59e0b]' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-[#16a34a]' },
    { label: 'Customers', value: stats.totalCustomers, icon: '👥', color: 'bg-[#7c3aed]' },
    { label: 'Menu Items', value: stats.totalItems, icon: '🍽️', color: 'bg-[#0ea5e9]' },
    { label: 'Categories', value: stats.totalCategories, icon: '📂', color: 'bg-[#f59e0b]' },
    { label: 'Active Offers', value: stats.activeOffers, icon: '🎁', color: 'bg-[#16a34a]' },
    { label: 'News Posts', value: stats.pendingNews, icon: '📰', color: 'bg-[#7c3aed]' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ea580c] animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black">Dashboard</h1>
          <p className="text-sm text-black/60 mt-1">Manage your restaurant from one place</p>
        </div>
        <Link href="/admin/menu" className="rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-black text-white hover:bg-[#c2410c]">
          + Add Menu Item
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={`/admin/${c.label.toLowerCase().replace(/ /g, '-')}`} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-center gap-3">
              <div className={`${c.color} grid h-12 w-12 place-items-center rounded-xl text-white text-xl`}>{c.icon}</div>
              <div>
                <div className="text-xs font-bold text-black/50">{c.label}</div>
                <div className="text-xl font-black">{c.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Link href="/admin/menu" className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-black text-lg">Menu Management</h2>
          <p className="text-sm text-black/60 mt-1">Add, edit, or remove menu items and categories</p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/menu" className="rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-bold text-white">Manage Items</Link>
            <Link href="/admin/categories" className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">Manage Categories</Link>
          </div>
        </Link>

        <Link href="/admin/offers" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-black text-lg">Offers & Coupons</h2>
          <p className="text-sm text-black/60 mt-1">Create and manage offers, flat discounts, free items</p>
          <Link href="/admin/offers" className="mt-4 inline-block rounded-xl bg-[#16a34a] px-4 py-2 text-sm font-bold text-white">Manage Offers</Link>
        </Link>

        <Link href="/admin/news" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-black text-lg">News & Updates</h2>
          <p className="text-sm text-black/60 mt-1">Post announcements, updates, and promotions</p>
          <Link href="/admin/news" className="mt-4 inline-block rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-bold text-white">Manage News</Link>
        </Link>

        <Link href="/admin/orders" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-black text-lg">Orders</h2>
          <p className="text-sm text-black/60 mt-1">View and manage customer orders</p>
          <Link href="/admin/orders" className="mt-4 inline-block rounded-xl bg-[#ea580c] px-4 py-2 text-sm font-bold text-white">Manage Orders</Link>
        </Link>

        <Link href="/admin/bulk" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="font-black text-lg">Bulk Orders</h2>
          <p className="text-sm text-black/60 mt-1">Manage bulk order requests and quotes</p>
          <Link href="/admin/bulk" className="mt-4 inline-block rounded-xl bg-[#0ea5e9] px-4 py-2 text-sm font-bold text-white">View Bulk</Link>
        </Link>
      </div>
    </div>
  );
}