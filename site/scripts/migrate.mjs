import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  for (const p of ['.env.local', '../.env.local', '../../.env.local']) {
    try {
      const full = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')), p);
      if (fs.existsSync(full)) {
        const txt = fs.readFileSync(full, 'utf-8');
        for (const line of txt.split('\n')) {
          const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
          if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
        }
      }
    } catch {}
  }
  // also try cwd
  for (const p of ['site/.env.local', '.env.local']) {
    try {
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf-8');
        for (const line of txt.split('\n')) {
          const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
          if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
        }
      }
    } catch {}
  }
}
loadEnv();
const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!conn) { console.error('No DATABASE_URL'); process.exit(1); }
const sql = neon(conn);

async function run() {
  console.log('Connecting to Neon...');
  // Enable pgcrypto for gen_random_uuid if needed
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  // Categories
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('categories ok');

  // Menu items - full spec
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT,
      image_url TEXT,
      half_price INT,
      full_price INT,
      single_price INT,
      price_type TEXT NOT NULL DEFAULT 'single' CHECK (price_type IN ('single','half_full')),
      is_available BOOLEAN NOT NULL DEFAULT true,
      is_veg BOOLEAN NOT NULL DEFAULT true,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      rating NUMERIC(2,1) DEFAULT 4.5,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('menu_items ok');

  // Combos
  await sql`
    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      price INT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('combos ok');

  await sql`
    CREATE TABLE IF NOT EXISTS combo_items (
      combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE,
      menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
      quantity INT NOT NULL DEFAULT 1,
      PRIMARY KEY (combo_id, menu_item_id)
    )`;
  console.log('combo_items ok');

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('users ok');

  // Addresses
  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT,
      phone TEXT,
      address TEXT NOT NULL,
      landmark TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home','work','other')),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('addresses ok');

  // Carts
  await sql`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
      combo_id TEXT REFERENCES combos(id) ON DELETE CASCADE,
      variant TEXT,
      quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
      price_snapshot INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK ( (menu_item_id IS NOT NULL)::int + (combo_id IS NOT NULL)::int = 1 ),
      UNIQUE(user_id, menu_item_id, combo_id, variant)
    )`;
  console.log('carts ok');

  // Wishlists
  await sql`
    CREATE TABLE IF NOT EXISTS wishlists (
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, menu_item_id)
    )`;
  console.log('wishlists ok');

  // Orders
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      subtotal INT NOT NULL,
      discount INT NOT NULL DEFAULT 0,
      delivery_fee INT NOT NULL DEFAULT 0,
      total INT NOT NULL,
      coupon_code TEXT,
      offer_id TEXT,
      payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','razorpay','online')),
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
      order_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN ('PENDING','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('orders ok');

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
      combo_id TEXT REFERENCES combos(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      variant TEXT,
      quantity INT NOT NULL,
      unit_price INT NOT NULL,
      total_price INT NOT NULL
    )`;
  console.log('order_items ok');

  // Coupons
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('flat','percent')),
      discount_value INT NOT NULL,
      minimum_order INT NOT NULL DEFAULT 0,
      maximum_discount INT,
      usage_limit INT,
      per_user_limit INT,
      used_count INT NOT NULL DEFAULT 0,
      start_date TIMESTAMPTZ,
      expiry_date TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('coupons ok');

  await sql`
    CREATE TABLE IF NOT EXISTS coupon_usages (
      id TEXT PRIMARY KEY,
      coupon_code TEXT REFERENCES coupons(code) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      discount INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(coupon_code, user_id, order_id)
    )`;
  console.log('coupon_usages ok');

  // Offers
  await sql`
    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      discount INT,
      minimum_order INT,
      start_date TIMESTAMPTZ,
      expiry_date TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      applicable_to TEXT DEFAULT 'order' CHECK (applicable_to IN ('order','category','food','combo')),
      applicable_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log('offers ok');

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id)`;

  // Keep legacy app_storage for fallback
  await sql`CREATE TABLE IF NOT EXISTS app_storage (key TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())`;

  console.log('All tables created');

  // Seed check
  const [{ count: catCount }] = await sql`SELECT COUNT(*)::int as count FROM categories`;
  const [{ count: itemCount }] = await sql`SELECT COUNT(*)::int as count FROM menu_items`;
  console.log(`Existing: ${catCount} categories, ${itemCount} items`);
  if (catCount === 0 || itemCount === 0) {
    console.log('Seeding from static data/menu.ts...');
    const rows = await sql`SELECT data FROM app_storage WHERE key = 'menu.json' LIMIT 1`;
    let cats = null;
    if (rows.length && rows[0].data?.categories?.length) {
      cats = rows[0].data.categories;
      console.log('Using app_storage menu.json with', cats.length, 'categories');
    } else {
      console.log('No app_storage menu, trying to load static seed fallback');
      // Fallback: try to load via dynamic import with tsx handling, else use minimal hardcoded
      try {
        cats = await loadStaticCategories();
        console.log('Loaded static categories via fallback loader', cats?.length);
      } catch (e) {
        console.error('Failed to load static categories', e);
      }
    }
    if (cats && cats.length) {
      for (let i = 0; i < cats.length; i++) {
        const c = cats[i];
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        await sql`INSERT INTO categories (id, name, slug, icon, display_order) VALUES (${c.id}, ${c.name}, ${slug}, ${c.icon}, ${i}) ON CONFLICT (id) DO NOTHING`;
        for (let j = 0; j < c.items.length; j++) {
          const it = c.items[j];
          const itemSlug = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          const hasHalf = it.half != null && it.full != null;
          const priceType = hasHalf ? 'half_full' : 'single';
          const half_price = it.half || null;
          const full_price = it.full || null;
          const single_price = hasHalf ? null : it.price;
          const is_featured = !!it.bestSeller;
          await sql`
            INSERT INTO menu_items (id, name, slug, category_id, description, image_url, half_price, full_price, single_price, price_type, is_available, is_veg, is_featured, rating, display_order)
            VALUES (${it.id}, ${it.name}, ${itemSlug + '-' + c.id}, ${c.id}, ${it.description || ''}, ${it.image || ''}, ${half_price}, ${full_price}, ${single_price}, ${priceType}, true, ${!!it.veg}, ${is_featured}, ${it.rating || 4.5}, ${j})
            ON CONFLICT (id) DO NOTHING
          `;
        }
      }
      console.log('Seeded categories and items');
    }
    const comboCat = cats ? cats.find((c) => c.id === 'combos') : null;
    if (comboCat) {
      for (const it of comboCat.items) {
        const slug = it.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        const exists = await sql`SELECT id FROM combos WHERE id = ${it.id} LIMIT 1`;
        if (!exists.length) {
          await sql`INSERT INTO combos (id, name, slug, description, image_url, price, is_active, display_order) VALUES (${it.id}, ${it.name}, ${slug}, ${it.description || ''}, ${it.image || ''}, ${it.price}, true, 0) ON CONFLICT (id) DO NOTHING`;
        }
      }
      console.log('Seeded combos');
    }
  } else {
    console.log('Seed skipped - data exists');
  }

  console.log('Migration complete');
}

run().catch(e => { console.error(e); process.exit(1); });
