'use client';
import { useEffect, useState, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface MenuItem {
  id: string;
  title: string;
  category: string;
  priceHalf: number;
  priceFull: number;
  image: string;
  isAvailable: boolean;
}

export interface BulkOrder {
  id: string;
  customerName: string;
  phone: string;
  date: string; // ISO yyyy-mm-dd
  status: 'Pending' | 'Approved' | 'Completed';
  itemsCount: number;
  totalAmount: number;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Static fallback data derived from data/menu.ts
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Thali',
  'Combos',
  'Chinese Food',
  'Roasted Chaap',
  'Chaap Rolls',
  'Main Course',
  'Momos',
  'Burgers / Snacks',
  'Beverages',
  'Extras',
] as const;

const INITIAL_MENU: MenuItem[] = [
  { id: 'thali-thali', title: 'Thali', category: 'Thali', priceHalf: 0, priceFull: 199, image: '/images/foods/thali.jpg', isAvailable: true },
  { id: 'thali-special-thali', title: 'Special Thali', category: 'Thali', priceHalf: 0, priceFull: 299, image: '/images/foods/special-thali.jpg', isAvailable: true },
  { id: 'combos-mini-combo', title: 'Mini Combo', category: 'Combos', priceHalf: 149, priceFull: 149, image: '/images/foods/mini-combo.jpg', isAvailable: true },
  { id: 'combos-family-combo', title: 'Family Combo', category: 'Combos', priceHalf: 399, priceFull: 399, image: '/images/foods/family-combo.jpg', isAvailable: true },
  { id: 'combos-party-combo', title: 'Party Combo', category: 'Combos', priceHalf: 599, priceFull: 599, image: '/images/foods/party-combo.jpg', isAvailable: true },
  { id: 'chinese-schezwan-noodles', title: 'Schezwan Noodles', category: 'Chinese Food', priceHalf: 120, priceFull: 230, image: '/images/foods/schezwan-noodles.jpg', isAvailable: true },
  { id: 'chinese-hakka-noodles', title: 'Hakka Noodles', category: 'Chinese Food', priceHalf: 120, priceFull: 230, image: '/images/foods/hakka-noodles.jpg', isAvailable: true },
  { id: 'chinese-chilli-paneer', title: 'Chilli Paneer', category: 'Chinese Food', priceHalf: 150, priceFull: 290, image: '/images/foods/chilli-paneer.jpg', isAvailable: true },
  { id: 'chinese-chilli-potato', title: 'Chilli Potato', category: 'Chinese Food', priceHalf: 120, priceFull: 230, image: '/images/foods/chilli-potato.jpg', isAvailable: true },
  { id: 'chinese-honey-chilli-potato', title: 'Honey Chilli Potato', category: 'Chinese Food', priceHalf: 150, priceFull: 290, image: '/images/foods/honey-chilli-potato.jpg', isAvailable: true },
  { id: 'roasted-chaap-malai-chaap', title: 'Malai Chaap', category: 'Roasted Chaap', priceHalf: 150, priceFull: 290, image: '/images/foods/malai-chaap.jpg', isAvailable: true },
  { id: 'roasted-chaap-afghani-chaap', title: 'Afghani Chaap', category: 'Roasted Chaap', priceHalf: 150, priceFull: 290, image: '/images/foods/afghani-chaap.jpg', isAvailable: true },
  { id: 'roasted-chaap-paneer-tikka-chaap', title: 'Paneer Tikka Chaap', category: 'Roasted Chaap', priceHalf: 180, priceFull: 350, image: '/images/foods/paneer-tikka-chaap.jpg', isAvailable: true },
  { id: 'chaap-rolls-malai-chaap-roll', title: 'Malai Chaap Roll', category: 'Chaap Rolls', priceHalf: 0, priceFull: 160, image: '/images/foods/malai-chaap-roll.jpg', isAvailable: true },
  { id: 'chaap-rolls-afghani-chaap-roll', title: 'Afghani Chaap Roll', category: 'Chaap Rolls', priceHalf: 0, priceFull: 160, image: '/images/foods/afghani-chaap-roll.jpg', isAvailable: true },
  { id: 'main-course-paneer-butter-masala', title: 'Paneer Butter Masala', category: 'Main Course', priceHalf: 180, priceFull: 350, image: '/images/foods/paneer-butter-masala.jpg', isAvailable: true },
  { id: 'main-course-kadai-paneer', title: 'Kadai Paneer', category: 'Main Course', priceHalf: 150, priceFull: 290, image: '/images/foods/kadai-paneer.jpg', isAvailable: true },
  { id: 'main-course-dal-makhni', title: 'Shahi Paneer', category: 'Main Course', priceHalf: 180, priceFull: 350, image: '/images/foods/shahi-paneer.jpg', isAvailable: true },
  { id: 'momos-steam-momos', title: 'Steam Momos (6 Pc.)', category: 'Momos', priceHalf: 80, priceFull: 80, image: '/images/foods/steam-momos-6-pc.jpg', isAvailable: true },
  { id: 'momos-tandoori-momos', title: 'Tandoori Momos', category: 'Momos', priceHalf: 150, priceFull: 150, image: '/images/foods/tandoori-momos.jpg', isAvailable: true },
  { id: 'momos-afghani-momos', title: 'Afghani Momos', category: 'Momos', priceHalf: 160, priceFull: 160, image: '/images/foods/afghani-momos.jpg', isAvailable: true },
  { id: 'burgers-veg-burger', title: 'Veg Burger', category: 'Burgers / Snacks', priceHalf: 79, priceFull: 79, image: '/images/foods/veg-burger.jpg', isAvailable: true },
  { id: 'burgers-paneer-burger', title: 'Paneer Burger', category: 'Burgers / Snacks', priceHalf: 119, priceFull: 119, image: '/images/foods/paneer-burger.jpg', isAvailable: true },
  { id: 'beverages-cold-coffee', title: 'Cold Coffee', category: 'Beverages', priceHalf: 89, priceFull: 89, image: '/images/foods/cold-coffee.jpg', isAvailable: false },
  { id: 'beverages-lassi', title: 'Lassi (Sweet / Salted)', category: 'Beverages', priceHalf: 69, priceFull: 69, image: '/images/foods/lassi-sweet-salted.jpg', isAvailable: true },
  { id: 'extras-butter-naan', title: 'Butter Naan', category: 'Extras', priceHalf: 35, priceFull: 35, image: '/images/foods/butter-naan.jpg', isAvailable: true },
  { id: 'extras-jeera-rice', title: 'Jeera Rice', category: 'Extras', priceHalf: 90, priceFull: 90, image: '/images/foods/jeera-rice.jpg', isAvailable: true },
];

const INITIAL_BULK: BulkOrder[] = [
  { id: 'BLK-1001', customerName: 'Rajesh Verma', phone: '9876543210', date: '2026-08-28', status: 'Pending', itemsCount: 45, totalAmount: 12450, message: 'Office party — 45 Thalis, need delivery by 1 PM, pure veg only.' },
  { id: 'BLK-1002', customerName: 'Priya Sharma', phone: '9123456780', date: '2026-08-27', status: 'Approved', itemsCount: 120, totalAmount: 34800, message: 'Wedding catering — 120 guests, mix of Chaap & Chinese. Advance paid ₹10k.' },
  { id: 'BLK-1003', customerName: 'Aman Gupta', phone: '9988776655', date: '2026-08-26', status: 'Pending', itemsCount: 30, totalAmount: 8900, message: 'Birthday party — 30 Momos platters + Cold Coffee.' },
  { id: 'BLK-1004', customerName: 'Neha Singh', phone: '9090909090', date: '2026-08-25', status: 'Completed', itemsCount: 60, totalAmount: 18900, message: 'Society function — delivered successfully, payment done.' },
  { id: 'BLK-1005', customerName: 'Vikram Yadav', phone: '8887776666', date: '2026-08-29', status: 'Pending', itemsCount: 80, totalAmount: 24500, message: 'Corporate lunch — 80 Family Combos, GST bill required.' },
  { id: 'BLK-1006', customerName: 'Ananya Patel', phone: '9001122334', date: '2026-08-30', status: 'Approved', itemsCount: 25, totalAmount: 6250, message: 'Kitty party — 25 Special Thalis, 12:30 PM.' },
];

// ─────────────────────────────────────────────────────────────
// Lucide-style inline icons (no external dependency)
// ─────────────────────────────────────────────────────────────
const Icon = {
  Search: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16 16" />
    </svg>
  ),
  Plus: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Edit: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Trash: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4h8v2" />
    </svg>
  ),
  X: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Download: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}>
      <path d="M12 3v13" />
      <path d="M7 12l5 5 5-5" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </svg>
  ),
  Menu: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Grid: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  List: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={p.className} {...p}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  Phone: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={p.className} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5 10.72 19.8 19.8 0 0 1 2 2.18 2 2 0 0 1 4 0h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.7 2.62a2 2 0 0 1-.57 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.57c.84.35 1.72.58 2.62.7A2 2 0 0 1 22 14v2z" />
    </svg>
  ),
  Check: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={p.className} {...p}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  Eye: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={p.className} {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'menu' | 'bulk'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>(INITIAL_BULK);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkStatusFilter, setBulkStatusFilter] = useState<'All' | BulkOrder['status']>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // form state
  const [form, setForm] = useState<MenuItem>({
    id: '',
    title: '',
    category: CATEGORIES[0],
    priceHalf: 0,
    priceFull: 0,
    image: '',
    isAvailable: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── localStorage: load
  useEffect(() => {
    setHasMounted(true);
    try {
      const m = localStorage.getItem('apna-baithak:menu');
      const b = localStorage.getItem('apna-baithak:bulkOrders');
      if (m) {
        const parsed = JSON.parse(m) as MenuItem[];
        if (Array.isArray(parsed) && parsed.length) setMenuItems(parsed);
      }
      if (b) {
        const parsedB = JSON.parse(b) as BulkOrder[];
        if (Array.isArray(parsedB) && parsedB.length) setBulkOrders(parsedB);
      }
    } catch (e) {
      console.warn('localStorage parse failed', e);
    }
  }, []);

  // ── localStorage: save
  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('apna-baithak:menu', JSON.stringify(menuItems));
  }, [menuItems, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('apna-baithak:bulkOrders', JSON.stringify(bulkOrders));
  }, [bulkOrders, hasMounted]);

  // ── toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter((it) => {
      const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) || it.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || it.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [menuItems, search, categoryFilter]);

  const filteredBulk = useMemo(() => {
    return bulkOrders.filter((o) => {
      const s = bulkSearch.toLowerCase();
      const matchSearch = !s || o.customerName.toLowerCase().includes(s) || o.phone.includes(s) || o.id.toLowerCase().includes(s);
      const matchStatus = bulkStatusFilter === 'All' || o.status === bulkStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bulkOrders, bulkSearch, bulkStatusFilter]);

  const stats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter((i) => i.isAvailable).length;
    const pendingBulk = bulkOrders.filter((o) => o.status === 'Pending').length;
    const revenue = bulkOrders.reduce((a, b) => a + b.totalAmount, 0);
    return { total, available, pendingBulk, revenue, cats: CATEGORIES.length };
  }, [menuItems, bulkOrders]);

  // ── helpers
  const showToast = (msg: string) => setToast(msg);

  const openAdd = () => {
    setEditing(null);
    setForm({ id: '', title: '', category: CATEGORIES[0], priceHalf: 0, priceFull: 0, image: '', isAvailable: true });
    setFormErrors({});
    setIsModalOpen(true);
  };
  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({ ...item });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Category required';
    if (form.priceFull <= 0) e.priceFull = 'MRP Full must be > 0';
    if (form.priceHalf < 0) e.priceHalf = 'MRP Half cannot be negative';
    if (!form.image.trim()) e.image = 'Image URL / path required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editing) {
      setMenuItems((prev) => prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)));
      showToast(`Updated "${form.title}"`);
    } else {
      const id = form.id.trim() ? slug(form.id) : slug(form.title) + '-' + Date.now().toString(36).slice(2, 6);
      const newItem: MenuItem = { ...form, id };
      setMenuItems((prev) => [newItem, ...prev]);
      showToast(`Added "${form.title}"`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this dish permanently?')) return;
    setMenuItems((prev) => prev.filter((p) => p.id !== id));
    showToast('Dish deleted');
  };

  const toggleAvailable = (id: string) => {
    setMenuItems((prev) => prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  const updateBulkStatus = (id: string, status: BulkOrder['status']) => {
    setBulkOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(`Order ${id} → ${status}`);
  };

  const exportConfig = () => {
    const payload = menuItems;
    // pretty + grouped by category variant for convenience
    const grouped = CATEGORIES.map((cat) => ({ category: cat, items: payload.filter((i) => i.category === cat) }));
    console.log('%c Apna Baithak — Current Static Config ', 'background:#ea580c;color:white;font-weight:900;padding:6px 12px;border-radius:8px;');
    console.log(JSON.stringify(payload, null, 2));
    console.groupCollapsed('Grouped by Category');
    console.log(JSON.stringify(grouped, null, 2));
    console.groupEnd();
    console.log('Copy the array above and paste into data/menu.ts → allItems / menuCategories');
    // also provide downloadable copy aid
    try {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      showToast('Config copied to clipboard & logged to console');
    } catch {
      showToast('Config logged to console (copy manually)');
    }
  };

  const statusBadge = (s: BulkOrder['status']) => {
    if (s === 'Pending') return 'bg-amber-100 text-amber-800 ring-amber-200';
    if (s === 'Approved') return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
    return 'bg-sky-100 text-sky-700 ring-sky-200';
  };

  if (!hasMounted) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-[#ea580c]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] -m-4 sm:-m-6">
      {/* Header */}
      <div className="sticky top-[57px] z-20 backdrop-blur-xl bg-white/80 border-b border-black/5">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen((v) => !v)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-black/5 shadow-sm"
              aria-label="Toggle sidebar"
            >
              <Icon.Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff7a1a] to-[#ea580c] text-white font-black shadow-lg">AB</div>
              <div>
                <h1 className="font-black leading-none text-[18px] sm:text-xl tracking-tight text-[#1c0a00]">
                  Apna Baithak <span className="font-semibold text-black/40">— Admin</span>
                </h1>
                <p className="text-xs font-medium text-black/50">Pure Veg • Eldeco City • Live Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">{stats.available}/{stats.total} Available</span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">{stats.pendingBulk} Pending Bulk</span>
            </div>
            <button
              onClick={exportConfig}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-black transition"
            >
              <Icon.Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Current Static Config</span>
              <span className="sm:hidden">Export Config</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileSidebarOpen ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-[300px] shrink-0 flex-col gap-4 lg:sticky lg:top-[137px] lg:h-[calc(100vh-150px)]`}
        >
          <div className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="grid gap-2">
              <button
                onClick={() => {
                  setActiveTab('menu');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition ${
                  activeTab === 'menu' ? 'bg-[#ea580c] text-white shadow-lg' : 'bg-[#fff7ed] text-[#1c0a00] hover:bg-orange-50'
                }`}
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${activeTab === 'menu' ? 'bg-white/20' : 'bg-white ring-1 ring-black/5'}`}>
                  🍔
                </span>
                <div className="flex-1">
                  <div className="text-sm font-black leading-none">Food Menu Manager</div>
                  <div className={`text-xs ${activeTab === 'menu' ? 'text-white/80' : 'text-black/50'}`}>{filteredMenu.length} dishes • {stats.cats} categories</div>
                </div>
                {activeTab === 'menu' && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
              </button>

              <button
                onClick={() => {
                  setActiveTab('bulk');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition ${
                  activeTab === 'bulk' ? 'bg-[#111827] text-white shadow-lg' : 'bg-gray-50 text-[#1c0a00] hover:bg-gray-100'
                }`}
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${activeTab === 'bulk' ? 'bg-white/15' : 'bg-white ring-1 ring-black/5'}`}>
                  📦
                </span>
                <div className="flex-1">
                  <div className="text-sm font-black leading-none">Bulk Order Tracker</div>
                  <div className={`text-xs ${activeTab === 'bulk' ? 'text-white/60' : 'text-black/50'}`}>{bulkOrders.length} enquiries • ₹{stats.revenue.toLocaleString('en-IN')} pipeline</div>
                </div>
                {activeTab === 'bulk' && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] p-4 ring-1 ring-orange-100">
              <div className="text-xs font-black tracking-widest text-[#ea580c]">PURE VEG • SINCE 2021</div>
              <div className="mt-1 text-sm font-bold leading-snug">Need help with bulk pricing?</div>
              <div className="mt-1 text-xs text-black/60">Call 8299751213 or update menu MRPs instantly from this panel. Changes persist via localStorage.</div>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black ring-1 ring-black/5">Auto-saved</span>
                <span className="rounded-full bg-[#ea580c] px-2.5 py-1 text-[11px] font-black text-white">Live</span>
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="text-xs font-bold text-black/40">Total Dishes</div>
              <div className="text-2xl font-black">{stats.total}</div>
              <div className="text-xs font-semibold text-emerald-600">{stats.available} available</div>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="text-xs font-bold text-black/40">Bulk Orders</div>
              <div className="text-2xl font-black">{bulkOrders.length}</div>
              <div className="text-xs font-semibold text-amber-600">{stats.pendingBulk} pending</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {activeTab === 'menu' ? (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Icon.Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by food title or category..."
                        className="h-11 w-full rounded-xl border border-black/10 bg-[#fffdf8] pl-10 pr-4 text-sm font-medium outline-none placeholder:text-black/30 focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="grid h-11 w-11 place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-black hover:text-white transition"
                        title="Toggle view"
                      >
                        {viewMode === 'grid' ? <Icon.List className="h-5 w-5" /> : <Icon.Grid className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={openAdd}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ea580c] px-5 text-sm font-black text-white shadow-md hover:bg-[#c2410c] transition"
                      >
                        <Icon.Plus className="h-4 w-4" /> Add New Dish
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {['All', ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ring-1 transition ${
                        categoryFilter === cat
                          ? 'bg-[#ea580c] text-white ring-[#ea580c] shadow'
                          : 'bg-white text-black/70 ring-black/10 hover:bg-[#fff7ed]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count bar */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold text-black/60">
                  Showing <span className="font-black text-black">{filteredMenu.length}</span> of {menuItems.length} dishes
                  {categoryFilter !== 'All' && <span className="ml-1">in <span className="text-[#ea580c]">{categoryFilter}</span></span>}
                </p>
                <span className="hidden sm:inline text-xs font-bold text-black/40">Tip: Toggle availability instantly • Edit photo via URL</span>
              </div>

              {/* Grid / List */}
              {filteredMenu.length === 0 ? (
                <div className="rounded-[22px] bg-white p-12 text-center ring-1 ring-black/5">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-xl">🔍</div>
                  <h3 className="mt-4 font-black">No dishes found</h3>
                  <p className="mt-1 text-sm text-black/50">Try a different search or category.</p>
                  <button onClick={() => { setSearch(''); setCategoryFilter('All'); }} className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white">Clear filters</button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/5 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className="relative h-44 overflow-hidden bg-[#fff7ed]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-[1.04] transition duration-500"
                          onError={(e) => ((e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(item.id)}/600/400`)}
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 backdrop-blur ${item.isAvailable ? 'bg-emerald-500 text-white ring-emerald-600' : 'bg-white/90 text-black/60 ring-black/10'}`}>
                            {item.isAvailable ? '● Available' : '○ Unavailable'}
                          </span>
                        </div>
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black ring-1 ring-black/5 backdrop-blur">{item.category}</div>
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                          <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                            {item.priceHalf > 0 && item.priceHalf !== item.priceFull ? (
                              <>Half ₹{item.priceHalf} • Full ₹{item.priceFull}</>
                            ) : (
                              <>₹{item.priceFull}</>
                            )}
                          </span>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" checked={item.isAvailable} onChange={() => toggleAvailable(item.id)} className="peer sr-only" />
                            <div className="peer h-7 w-12 rounded-full bg-white/90 ring-1 ring-black/10 peer-checked:bg-emerald-500 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
                          </label>
                        </div>
                      </div>

                      <div className="p-4 flex flex-1 flex-col">
                        <h3 className="font-black leading-tight line-clamp-1">{item.title}</h3>
                        <p className="mt-1 text-xs font-mono text-black/40">{item.id}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => openEdit(item)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#fff7ed] px-3 py-2.5 text-sm font-bold ring-1 ring-orange-200 hover:bg-[#ea580c] hover:text-white transition">
                            <Icon.Edit className="h-4 w-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="grid h-[42px] w-[42px] place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 transition">
                            <Icon.Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5 shadow-sm">
                  <div className="divide-y divide-black/5">
                    {filteredMenu.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 hover:bg-[#fffdf8] transition">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.title}
                          className="h-16 w-20 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
                          onError={(e) => ((e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(item.id)}/200/200`)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold leading-none">{item.title}</h4>
                            <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-black ring-1 ring-orange-100">{item.category}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${item.isAvailable ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-100 text-black/50 ring-black/10'}`}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-mono text-black/40">{item.id}</p>
                          <p className="mt-1 text-sm font-black">
                            {item.priceHalf > 0 && item.priceHalf !== item.priceFull ? (
                              <><span className="text-black/50 font-semibold">Half</span> ₹{item.priceHalf} <span className="mx-1 text-black/20">•</span> <span className="text-black/50 font-semibold">Full</span> ₹{item.priceFull}</>
                            ) : (
                              <>₹{item.priceFull}</>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 self-center">
                          <label className="relative inline-flex cursor-pointer items-center self-end">
                            <input type="checkbox" checked={item.isAvailable} onChange={() => toggleAvailable(item.id)} className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
                          </label>
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(item)} className="rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ea580c]">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-red-50 hover:text-red-600">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // BULK TAB
            <div className="space-y-4">
              <div className="rounded-[22px] bg-white p-4 sm:p-5 shadow-sm ring-1 ring-black/5">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <h2 className="font-black text-lg flex items-center gap-2">📦 Bulk Order Tracker <span className="rounded-full bg-black px-2.5 py-1 text-xs font-black text-white">{bulkOrders.length}</span></h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Icon.Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                      <input
                        value={bulkSearch}
                        onChange={(e) => setBulkSearch(e.target.value)}
                        placeholder="Search customer, phone, ID..."
                        className="h-10 w-full rounded-xl border border-black/10 bg-gray-50 pl-9 pr-3 text-sm font-medium outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                      />
                    </div>
                    <select
                      value={bulkStatusFilter}
                      onChange={(e) => setBulkStatusFilter(e.target.value as any)}
                      className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(['Pending', 'Approved', 'Completed'] as const).map((s) => {
                    const cnt = bulkOrders.filter((o) => o.status === s).length;
                    return (
                      <div key={s} className={`rounded-2xl p-3 ring-1 ${s === 'Pending' ? 'bg-amber-50 ring-amber-200' : s === 'Approved' ? 'bg-emerald-50 ring-emerald-200' : 'bg-sky-50 ring-sky-200'}`}>
                        <div className="text-xs font-bold opacity-60">{s}</div>
                        <div className="text-xl font-black">{cnt}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table - desktop */}
              <div className="hidden lg:block overflow-hidden rounded-[22px] bg-white ring-1 ring-black/5 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#fff7ed] text-left text-xs font-black uppercase tracking-widest text-black/50">
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Phone</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4 text-center">Guests / Items</th>
                        <th className="px-5 py-4 text-right">Total</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredBulk.map((o) => (
                        <tr key={o.id} className="hover:bg-[#fffdf8] transition">
                          <td className="px-5 py-4">
                            <div className="font-bold leading-none">{o.customerName}</div>
                            <div className="mt-1 text-xs font-mono text-black/40">{o.id}</div>
                            <div className="mt-1 max-w-[260px] truncate text-xs text-black/60" title={o.message}>{o.message}</div>
                          </td>
                          <td className="px-5 py-4">
                            <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1.5 font-bold text-[#ea580c] hover:underline">
                              <Icon.Phone className="h-3.5 w-3.5" /> {o.phone}
                            </a>
                          </td>
                          <td className="px-5 py-4 font-medium whitespace-nowrap">{new Date(o.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-black text-white">{o.itemsCount} guests</span>
                          </td>
                          <td className="px-5 py-4 text-right font-black">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusBadge(o.status)}`}>{o.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <select
                                value={o.status}
                                onChange={(e) => updateBulkStatus(o.id, e.target.value as BulkOrder['status'])}
                                className="rounded-xl border border-black/10 bg-white px-2.5 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-black/5"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredBulk.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-black/50">No bulk orders match your filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards - mobile */}
              <div className="grid lg:hidden gap-3">
                {filteredBulk.map((o) => (
                  <div key={o.id} className="rounded-[22px] bg-white p-4 ring-1 ring-black/5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-black">{o.customerName}</div>
                        <div className="text-xs font-mono text-black/40">{o.id} • {o.date}</div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusBadge(o.status)}`}>{o.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 font-bold text-[#ea580c] ring-1 ring-orange-200">
                        <Icon.Phone className="h-3.5 w-3.5" /> {o.phone}
                      </a>
                      <span className="rounded-full bg-black px-3 py-1.5 font-black text-white">{o.itemsCount} guests</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-black text-emerald-700 ring-1 ring-emerald-200">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="mt-3 text-sm leading-snug text-black/70">{o.message}</p>
                    <div className="mt-3 flex gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateBulkStatus(o.id, e.target.value as BulkOrder['status'])}
                        className="flex-1 rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <a href={`tel:${o.phone}`} className="rounded-xl bg-[#ea580c] px-4 py-2.5 text-sm font-black text-white">Call</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-[560px] max-h-[90vh] overflow-hidden rounded-[26px] bg-white shadow-2xl animate-pop flex flex-col">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
              <div>
                <h3 className="font-black text-lg leading-none">{editing ? 'Edit Dish' : 'Add New Dish'}</h3>
                <p className="mt-1 text-xs font-medium text-black/50">{editing ? 'Update Title, MRP & Photo — changes apply instantly' : 'Create a new item and it will appear at the top of the menu'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-50 ring-1 ring-black/5 hover:bg-black hover:text-white transition">
                <Icon.X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {/* live preview */}
              <div className="flex gap-4 rounded-2xl bg-[#fff7ed] p-4 ring-1 ring-orange-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image || `https://picsum.photos/seed/${encodeURIComponent(form.title || 'preview')}/200/200`}
                  alt="preview"
                  className="h-20 w-20 rounded-xl object-cover ring-1 ring-black/5 bg-white"
                  onError={(e) => ((e.target as HTMLImageElement).src = `https://picsum.photos/seed/preview/200/200`)}
                />
                <div className="min-w-0">
                  <div className="font-black leading-tight">{form.title || 'Dish Title'}</div>
                  <div className="text-xs font-bold text-black/50">{form.category}</div>
                  <div className="mt-1 text-sm font-black">
                    {form.priceHalf ? `Half ₹${form.priceHalf} • ` : ''}Full ₹{form.priceFull || 0}
                  </div>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-black ring-1 ${form.isAvailable ? 'bg-emerald-500 text-white ring-emerald-600' : 'bg-white text-black/50 ring-black/10'}`}>
                    {form.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black tracking-widest text-black/60">TITLE / FOOD NAME *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Malai Chaap"
                  className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-semibold outline-none focus:ring-4 ${formErrors.title ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}
                />
                {formErrors.title && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.title}</p>}
              </div>

              <div>
                <label className="text-xs font-black tracking-widest text-black/60">CATEGORY *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black tracking-widest text-black/60">MRP HALF (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceHalf}
                    onChange={(e) => setForm((f) => ({ ...f, priceHalf: Number(e.target.value) || 0 }))}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold outline-none focus:ring-4 ${formErrors.priceHalf ? 'border-red-300 focus:ring-red-100' : 'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}
                  />
                  {formErrors.priceHalf && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.priceHalf}</p>}
                </div>
                <div>
                  <label className="text-xs font-black tracking-widest text-black/60">MRP FULL (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.priceFull}
                    onChange={(e) => setForm((f) => ({ ...f, priceFull: Number(e.target.value) || 0 }))}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold outline-none focus:ring-4 ${formErrors.priceFull ? 'border-red-300 focus:ring-red-100' : 'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}
                  />
                  {formErrors.priceFull && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.priceFull}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-black tracking-widest text-black/60">PHOTO URL / IMAGE PATH *</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="/images/foods/malai-chaap.jpg or https://..."
                  className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none focus:ring-4 ${formErrors.image ? 'border-red-300 focus:ring-red-100' : 'border-black/10 focus:border-[#ea580c] focus:ring-orange-100'}`}
                />
                {formErrors.image && <p className="mt-1 text-xs font-bold text-red-600">{formErrors.image}</p>}
                <p className="mt-1 text-xs text-black/40">Use local path from public/images/foods or full https URL.</p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-black/5">
                <div>
                  <div className="text-sm font-black">Available for ordering</div>
                  <div className="text-xs text-black/50">Toggle off to hide without deleting</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} className="peer sr-only" />
                  <div className="peer h-7 w-12 rounded-full bg-gray-300 peer-checked:bg-emerald-500 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              {!editing && (
                <div>
                  <label className="text-xs font-black tracking-widest text-black/60">CUSTOM ID (optional)</label>
                  <input
                    value={form.id}
                    onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                    placeholder="Auto-generated if left empty"
                    className="mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-mono outline-none focus:border-[#ea580c] focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-black/5 bg-gray-50 px-6 py-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl bg-white px-5 py-3 text-sm font-black ring-1 ring-black/10 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-black text-white shadow hover:bg-[#c2410c]">
                <Icon.Check className="h-4 w-4" /> {editing ? 'Save Changes' : 'Add Dish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">✓</span> {toast}
        </div>
      )}

      <style>{`@keyframes pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}.animate-pop{animation:pop .18s ease-out}`}</style>
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
