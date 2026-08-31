import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/data/storage';

async function verifyAdmin(req: NextRequest) {
  const t = req.cookies.get('admin_session')?.value;
  if (!t || !t.startsWith('admin_')) return null;
  const admins = await storage.getAdminsAsync();
  return admins.find(a => a.id === t.split('_')[1]) || null;
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { neon } = await import('@neondatabase/serverless');
  const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
  const sql = neon(conn);
  const logs: string[] = [];
  const log = (m: string) => logs.push(m);
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    await sql`CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT, display_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('categories ok');
    await sql`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, category_id TEXT REFERENCES categories(id) ON DELETE SET NULL, description TEXT, image_url TEXT, half_price INT, full_price INT, single_price INT, price_type TEXT NOT NULL DEFAULT 'single' CHECK (price_type IN ('single','half_full')), is_available BOOLEAN NOT NULL DEFAULT true, is_veg BOOLEAN NOT NULL DEFAULT true, is_featured BOOLEAN NOT NULL DEFAULT false, rating NUMERIC(2,1) DEFAULT 4.5, display_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('menu_items ok');
    await sql`CREATE TABLE IF NOT EXISTS combos (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, image_url TEXT, price INT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, display_order INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('combos ok');
    await sql`CREATE TABLE IF NOT EXISTS combo_items (combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE, menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE, quantity INT NOT NULL DEFAULT 1, PRIMARY KEY (combo_id, menu_item_id))`; log('combo_items ok');
    await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE, email TEXT UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('users ok');
    await sql`CREATE TABLE IF NOT EXISTS addresses (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, name TEXT, phone TEXT, address TEXT NOT NULL, landmark TEXT, city TEXT, state TEXT, pincode TEXT, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home','work','other')), is_default BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())`; log('addresses ok');
    await sql`CREATE TABLE IF NOT EXISTS carts (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE, combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE, variant TEXT, quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), price_snapshot INT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), CHECK ( (menu_item_id IS NOT NULL)::int + (combo_id IS NOT NULL)::int = 1 ), UNIQUE(user_id, menu_item_id, combo_id, variant))`; log('carts ok');
    await sql`CREATE TABLE IF NOT EXISTS wishlists (user_id TEXT REFERENCES users(id) ON DELETE CASCADE, menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY (user_id, menu_item_id))`; log('wishlists ok');
    await sql`CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, subtotal INT NOT NULL, discount INT NOT NULL DEFAULT 0, delivery_fee INT NOT NULL DEFAULT 0, total INT NOT NULL, coupon_code TEXT, offer_id TEXT, payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','razorpay','online')), payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')), order_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN ('PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')), notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('orders ok');
    await sql`CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT REFERENCES orders(id) ON DELETE CASCADE, menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL, combo_id TEXT REFERENCES combos(id) ON DELETE SET NULL, name TEXT NOT NULL, variant TEXT, quantity INT NOT NULL, unit_price INT NOT NULL, total_price INT NOT NULL)`; log('order_items ok');
    await sql`CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, discount_type TEXT NOT NULL CHECK (discount_type IN ('flat','percent')), discount_value INT NOT NULL, minimum_order INT NOT NULL DEFAULT 0, maximum_discount INT, usage_limit INT, per_user_limit INT, used_count INT NOT NULL DEFAULT 0, start_date TIMESTAMPTZ, expiry_date TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('coupons ok');
    await sql`CREATE TABLE IF NOT EXISTS coupon_usages (id TEXT PRIMARY KEY, coupon_code TEXT REFERENCES coupons(code) ON DELETE CASCADE, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, order_id TEXT REFERENCES orders(id) ON DELETE CASCADE, discount INT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(coupon_code, user_id, order_id))`; log('coupon_usages ok');
    await sql`CREATE TABLE IF NOT EXISTS offers (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, image_url TEXT, discount INT, minimum_order INT, start_date TIMESTAMPTZ, expiry_date TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT true, applicable_to TEXT DEFAULT 'order' CHECK (applicable_to IN ('order','category','food','combo')), applicable_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`; log('offers ok');
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)`; await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available)`; await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`; await sql`CREATE TABLE IF NOT EXISTS app_storage (key TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())`;

    const [{ count: catCount }] = await sql`SELECT COUNT(*)::int as count FROM categories`;
    const [{ count: itemCount }] = await sql`SELECT COUNT(*)::int as count FROM menu_items`;
    log(`Existing: ${catCount} categories, ${itemCount} items`);

    if (catCount === 0 || itemCount === 0) {
      log('Seeding from app_storage or static fallback');
      const rows = await sql`SELECT data FROM app_storage WHERE key='menu.json' LIMIT 1`;
      let cats: any = null;
      if (rows.length && (rows[0].data as any)?.categories?.length) {
        cats = (rows[0].data as any).categories;
        log(`Using app_storage menu.json with ${cats.length} categories`);
      } else {
        // Fallback: seed minimal from hardcoded via storage's seed logic (fetch via storage)
        // Try to get from legacy storage file via Neon fallback? For now, log and seed empty
        log('No app_storage menu found - seeding from storage fallback failed, inserting minimal categories');
        // Insert minimal categories to allow admin to add items
        const minimal = [
          { id: 'thali', name: 'Thali', icon: '🍽️' },
          { id: 'combos', name: 'Combos', icon: '🍱' },
          { id: 'chinese', name: 'Chinese Food', icon: '🍜' },
          { id: 'roasted-chaap', name: 'Roasted Chaap', icon: '🍢' },
          { id: 'chaap-rolls', name: 'Chaap Rolls', icon: '🌯' },
          { id: 'main-course', name: 'Main Course', icon: '🍛' },
          { id: 'momos', name: 'Momos', icon: '🥟' },
          { id: 'burgers', name: 'Burgers / Snacks', icon: '🍔' },
          { id: 'beverages', name: 'Beverages', icon: '🥤' },
          { id: 'extras', name: 'Extras', icon: '🫓' },
        ];
        for (let i = 0; i < minimal.length; i++) {
          const c = minimal[i];
          const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          await sql`INSERT INTO categories (id, name, slug, icon, display_order) VALUES (${c.id}, ${c.name}, ${slug}, ${c.icon}, ${i}) ON CONFLICT (id) DO NOTHING`;
        }
        log('Seeded minimal categories');
        return NextResponse.json({ success: true, logs, seeded: 'minimal' });
      }

      for (let i = 0; i < cats.length; i++) {
        const c = cats[i];
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        await sql`INSERT INTO categories (id, name, slug, icon, display_order) VALUES (${c.id}, ${c.name}, ${slug}, ${c.icon}, ${i}) ON CONFLICT (id) DO NOTHING`;
        for (let j = 0; j < c.items.length; j++) {
          const it = c.items[j];
          const itemSlug = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          const hasHalf = it.half != null && it.full != null;
          const priceType = hasHalf ? 'half_full' : 'single';
          const half_price = it.half ?? null;
          const full_price = it.full ?? null;
          const single_price = hasHalf ? null : (it.price ?? it.full ?? null);
          const is_featured = !!it.bestSeller;
          const is_veg = it.veg !== false;
          await sql`INSERT INTO menu_items (id, name, slug, category_id, description, image_url, half_price, full_price, single_price, price_type, is_available, is_veg, is_featured, rating, display_order) VALUES (${it.id}, ${it.name}, ${itemSlug + '-' + c.id}, ${c.id}, ${it.description || ''}, ${it.image || ''}, ${half_price}, ${full_price}, ${single_price}, ${priceType}, ${it.isAvailable !== false}, ${is_veg}, ${is_featured}, ${it.rating || 4.5}, ${j}) ON CONFLICT (id) DO NOTHING`;
        }
      }
      log('Seeded categories and items from app_storage');
      // Seed combos
      const comboCat = cats.find((c: any) => c.id === 'combos');
      if (comboCat) {
        for (const it of comboCat.items) {
          const slug = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          const exists = await sql`SELECT id FROM combos WHERE id=${it.id} LIMIT 1`;
          if (!exists.length) await sql`INSERT INTO combos (id, name, slug, description, image_url, price, is_active, display_order) VALUES (${it.id}, ${it.name}, ${slug}, ${it.description || ''}, ${it.image || ''}, ${it.price}, true, 0) ON CONFLICT (id) DO NOTHING`;
        }
        log('Seeded combos');
      }
    }
    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, logs }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
