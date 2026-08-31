import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1';
const STORAGE_DIR = IS_VERCEL ? path.join('/tmp', 'apna-baithak-storage') : path.join(process.cwd(), 'data', 'storage');

// In-memory fallback for Vercel (persists within lambda warm instance)
const mem = globalThis as unknown as {
  __AB_MEM__?: Record<string, unknown>;
};
if (!mem.__AB_MEM__) mem.__AB_MEM__ = {};
const memoryCache: Record<string, unknown> = mem.__AB_MEM__!;

function ensureStorageDir() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
  } catch {}
}

function readJSON<T>(filename: string, defaultValue: T): T {
  // 1) try memory (Vercel warm)
  if (memoryCache[filename] !== undefined) return memoryCache[filename] as T;
  // 2) try file
  ensureStorageDir();
  const filepath = path.join(STORAGE_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf-8');
      const parsed = JSON.parse(data) as T;
      memoryCache[filename] = parsed;
      return parsed;
    }
  } catch {}
  // 3) seed default & persist
  memoryCache[filename] = defaultValue;
  // lazy seed file for local & /tmp
  try {
    ensureStorageDir();
    fs.writeFileSync(path.join(STORAGE_DIR, filename), JSON.stringify(defaultValue, null, 2));
  } catch {}
  return defaultValue;
}

function writeJSON(filename: string, data: unknown) {
  memoryCache[filename] = data;
  ensureStorageDir();
  const filepath = path.join(STORAGE_DIR, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch {}
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'admin';
  createdAt: string;
}
export interface CustomerUser {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  addresses: Address[];
  wishlist: string[];
  favourites: string[];
  createdAt: string;
  banned?: boolean;
}
export interface Address {
  id: string;
  label: string;
  full: string;
  phone: string;
}
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  half?: number;
  full?: number;
  rating: number;
  bestSeller?: boolean;
  veg: boolean;
  image?: string;
  description?: string;
  isAvailable?: boolean;
}
export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}
export interface Offer {
  id: string;
  label: string;
  type: 'flat' | 'freeItem' | 'bulk';
  minOrder: number;
  value: number;
  freeItemValue?: number;
  desc: string;
  priority: number;
  active: boolean;
}
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Order {
  id: string;
  userId?: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  handlingFee: number;
  smallCartFee: number;
  tip: number;
  grandTotal: number;
  deliveryType: 'delivery' | 'takeaway' | 'dinein';
  address: string;
  phone: string;
  name: string;
  slot: string;
  payment: 'cod' | 'razorpay';
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  offerApplied?: { id: string; label: string; discount: number; freeItemValue?: number };
}
export interface BulkOrder {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  items: string;
  quantity: number;
  deliveryDate: string;
  message?: string;
  status: 'new' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  quotedPrice?: number;
}

const DEFAULT_ADMINS: AdminUser[] = [
  { id: 'admin-1', username: 'asm2242', password: 'asm.2242', role: 'admin', createdAt: new Date().toISOString() },
];
const DEFAULT_OFFERS: Offer[] = [
  { id: 'flat75', label: '₹75 OFF', type: 'flat', minOrder: 499, value: 75, desc: '₹75 off on orders above ₹499', priority: 1, active: true },
  { id: 'flat150', label: '₹150 OFF', type: 'flat', minOrder: 999, value: 150, desc: '₹150 off on orders above ₹999', priority: 2, active: true },
  { id: 'freeItem200', label: 'FREE ITEM ₹200', type: 'freeItem', minOrder: 1500, value: 200, freeItemValue: 200, desc: 'Order ₹1500+ and get any item worth ₹200 free', priority: 3, active: true },
  { id: 'freeItem250', label: 'FREE ITEM ₹250', type: 'freeItem', minOrder: 2000, value: 250, freeItemValue: 250, desc: 'Order ₹2000+ and get any item worth ₹250 free', priority: 4, active: true },
  { id: 'bulkOffer', label: 'BULK OFFER', type: 'bulk', minOrder: 3000, value: 0, desc: 'Special bulk order pricing - contact us for custom quote', priority: 5, active: true },
];
const DEFAULT_BULK_ORDERS: BulkOrder[] = [
  { id: 'bulk-1', name: 'ABC Corporation', phone: '9876543210', email: 'orders@abc.com', company: 'ABC Corp', items: 'Thali x50, Special Thali x30', quantity: 100, deliveryDate: '2026-09-05', message: 'Need for office lunch event', status: 'quoted', createdAt: '2024-01-20T10:30:00Z', quotedPrice: 25000 },
  { id: 'bulk-2', name: 'XYZ School', phone: '9876543211', email: 'admin@xyzschool.edu', company: 'XYZ School', items: 'Mini Combo x100', quantity: 150, deliveryDate: '2026-09-10', message: 'Annual day function', status: 'new', createdAt: '2024-01-22T14:20:00Z' },
  { id: 'bulk-3', name: 'Tech Solutions Pvt Ltd', phone: '9876543212', email: 'hr@techsolutions.com', company: 'Tech Solutions', items: 'Family Combo x30', quantity: 40, deliveryDate: '2026-09-02', message: 'Team lunch', status: 'confirmed', createdAt: '2024-01-18T09:15:00Z', quotedPrice: 18500 },
];

// Lazy seed menu from static file if storage empty
function getSeedMenu(): MenuCategory[] {
  try {
    // dynamic require to avoid circular
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@/data/menu') as { menuCategories: MenuCategory[] };
    if (mod?.menuCategories?.length) return mod.menuCategories;
  } catch {}
  return [];
}

function hasNeon() { return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL); }

// Keep sync for local dev; Neon uses async wrappers
export const storage = {
  getAdmins: () => readJSON<AdminUser[]>('admins.json', DEFAULT_ADMINS),
  saveAdmins: (admins: AdminUser[]) => writeJSON('admins.json', admins),
  getOffers: () => readJSON<Offer[]>('offers.json', DEFAULT_OFFERS),
  saveOffers: (offers: Offer[]) => writeJSON('offers.json', offers),
  getNews: () => readJSON<NewsItem[]>('news.json', []),
  saveNews: (news: NewsItem[]) => writeJSON('news.json', news),
  getOrders: () => readJSON<Order[]>('orders.json', []),
  saveOrders: (orders: Order[]) => writeJSON('orders.json', orders),
  getBulkOrders: () => readJSON<BulkOrder[]>('bulkOrders.json', DEFAULT_BULK_ORDERS),
  saveBulkOrders: (bulkOrders: BulkOrder[]) => writeJSON('bulkOrders.json', bulkOrders),
  getCustomers: () => readJSON<CustomerUser[]>('customers.json', []),
  saveCustomers: (customers: CustomerUser[]) => writeJSON('customers.json', customers),
  getMenu: () => {
    const seeded = getSeedMenu();
    const menuData = readJSON<{ categories: MenuCategory[] }>('menu.json', { categories: seeded });
    if ((!menuData.categories || menuData.categories.length === 0) && seeded.length) {
      writeJSON('menu.json', { categories: seeded });
      return seeded;
    }
    return menuData.categories;
  },
  saveMenu: (categories: MenuCategory[]) => writeJSON('menu.json', { categories }),

  // Async Neon-aware helpers (use when DATABASE_URL is set)
  getAdminsAsync: async () => {
    if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<AdminUser[]>('admins.json', DEFAULT_ADMINS); }
    return readJSON<AdminUser[]>('admins.json', DEFAULT_ADMINS);
  },
  saveAdminsAsync: async (admins: AdminUser[]) => {
    if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('admins.json', admins); } else writeJSON('admins.json', admins);
    writeJSON('admins.json', admins);
  },
  getOffersAsync: async () => {
    if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<Offer[]>('offers.json', DEFAULT_OFFERS); }
    return readJSON<Offer[]>('offers.json', DEFAULT_OFFERS);
  },
  saveOffersAsync: async (o: Offer[]) => { if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('offers.json', o); } writeJSON('offers.json', o); },
  getNewsAsync: async () => { if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<NewsItem[]>('news.json', []); } return readJSON<NewsItem[]>('news.json', []); },
  saveNewsAsync: async (n: NewsItem[]) => { if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('news.json', n); } writeJSON('news.json', n); },
  getOrdersAsync: async () => { if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<Order[]>('orders.json', []); } return readJSON<Order[]>('orders.json', []); },
  saveOrdersAsync: async (o: Order[]) => { if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('orders.json', o); } writeJSON('orders.json', o); },
  getBulkOrdersAsync: async () => { if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<BulkOrder[]>('bulkOrders.json', DEFAULT_BULK_ORDERS); } return readJSON<BulkOrder[]>('bulkOrders.json', DEFAULT_BULK_ORDERS); },
  saveBulkOrdersAsync: async (b: BulkOrder[]) => { if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('bulkOrders.json', b); } writeJSON('bulkOrders.json', b); },
  getCustomersAsync: async () => { if (hasNeon()) { const { neonGet } = await import('@/lib/neon'); return neonGet<CustomerUser[]>('customers.json', []); } return readJSON<CustomerUser[]>('customers.json', []); },
  saveCustomersAsync: async (c: CustomerUser[]) => { if (hasNeon()) { const { neonSet } = await import('@/lib/neon'); await neonSet('customers.json', c); } writeJSON('customers.json', c); },
  getMenuAsync: async () => {
    const seeded = getSeedMenu();
    if (hasNeon()) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
        const sql = neon(conn);
        // Try relational tables first
        const catRows = await sql`SELECT id, name, icon, display_order FROM categories ORDER BY display_order`;
        if (catRows.length > 0) {
          const cats: MenuCategory[] = [];
          for (const c of catRows as any[]) {
            const items = await sql`SELECT id, name, category_id as "categoryId", description, image_url as image, half_price as half, full_price as full, single_price as price, price_type, is_available as "isAvailable", is_veg as veg, is_featured as "bestSeller", rating FROM menu_items WHERE category_id=${c.id} ORDER BY display_order`;
            const mapped: MenuItem[] = (items as any[]).map((it: any) => ({
              id: it.id,
              name: it.name,
              category: c.name,
              categoryId: c.id,
              price: it.price ?? it.full ?? it.half ?? 0,
              half: it.half ?? undefined,
              full: it.full ?? undefined,
              rating: it.rating ? Number(it.rating) : 4.5,
              bestSeller: !!it.bestSeller,
              veg: !!it.veg,
              image: it.image || '',
              description: it.description || '',
              isAvailable: it.isAvailable !== false,
            }));
            cats.push({ id: c.id, name: c.name, icon: c.icon || '🍽️', items: mapped });
          }
          if (cats.length) return cats;
        }
      } catch {}
      const { neonGet, neonSet } = await import('@/lib/neon');
      const data = await neonGet<{ categories: MenuCategory[] }>('menu.json', { categories: seeded });
      if (!data.categories || data.categories.length === 0) {
        if (seeded.length) { await neonSet('menu.json', { categories: seeded }); return seeded; }
      }
      return data.categories;
    }
    const menuData = readJSON<{ categories: MenuCategory[] }>('menu.json', { categories: seeded });
    if ((!menuData.categories || menuData.categories.length === 0) && seeded.length) { writeJSON('menu.json', { categories: seeded }); return seeded; }
    return menuData.categories;
  },
  saveMenuAsync: async (cats: MenuCategory[]) => {
    if (hasNeon()) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
        const sql = neon(conn);
        const existingCats = await sql`SELECT id FROM categories`;
        const incomingIds = new Set(cats.map(c=>c.id));
        // Upsert categories and items
        for (let i = 0; i < cats.length; i++) {
          const c = cats[i];
          const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          await sql`INSERT INTO categories (id, name, slug, icon, display_order) VALUES (${c.id}, ${c.name}, ${slug}, ${c.icon}, ${i}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, icon=EXCLUDED.icon, display_order=EXCLUDED.display_order, updated_at=NOW()`;
          for (let j = 0; j < c.items.length; j++) {
            const it: any = c.items[j];
            const slugIt = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
            const priceType = (it.half != null && it.full != null) ? 'half_full' : 'single';
            const half_price = it.half ?? null;
            const full_price = it.full ?? null;
            const single_price = priceType === 'single' ? (it.price ?? it.full ?? null) : null;
            await sql`INSERT INTO menu_items (id, name, slug, category_id, description, image_url, half_price, full_price, single_price, price_type, is_available, is_veg, is_featured, rating, display_order) VALUES (${it.id}, ${it.name}, ${slugIt + '-' + c.id}, ${c.id}, ${it.description || ''}, ${it.image || ''}, ${half_price}, ${full_price}, ${single_price}, ${priceType}, ${it.isAvailable !== false}, ${it.veg !== false}, ${!!it.bestSeller}, ${it.rating || 4.5}, ${j}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, category_id=EXCLUDED.category_id, description=EXCLUDED.description, image_url=EXCLUDED.image_url, half_price=EXCLUDED.half_price, full_price=EXCLUDED.full_price, single_price=EXCLUDED.single_price, price_type=EXCLUDED.price_type, is_available=EXCLUDED.is_available, is_veg=EXCLUDED.is_veg, is_featured=EXCLUDED.is_featured, rating=EXCLUDED.rating, display_order=EXCLUDED.display_order, updated_at=NOW()`;
          }
          // Delete items that were removed from this category (safe loop)
          const keepIds = new Set(c.items.map((it: any) => it.id));
          const existingItems: any[] = await sql`SELECT id FROM menu_items WHERE category_id=${c.id}`;
          for (const row of existingItems) {
            if (!keepIds.has(row.id)) await sql`DELETE FROM menu_items WHERE id=${row.id}`;
          }
        }
        // Delete categories that no longer exist (and their items via cascade)
        for (const row of existingCats as any[]) {
          if (!incomingIds.has(row.id)) {
            await sql`DELETE FROM categories WHERE id=${row.id}`;
          }
        }
      } catch (e) { console.error('saveMenuAsync relational failed', e); }
      const { neonSet } = await import('@/lib/neon');
      await neonSet('menu.json', { categories: cats });
    }
    writeJSON('menu.json', { categories: cats });
  },
};

export function getNextId(prefix: string = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
