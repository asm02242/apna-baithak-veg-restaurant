import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
}
function getUserId(req: NextRequest) {
  const token = req.cookies.get("customer_session")?.value;
  if (!token) return null;
  return token.split("_")[1] || null;
}
function genId(prefix = "ord") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
async function ensureTables(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS orders (
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
  await sql`CREATE TABLE IF NOT EXISTS order_items (
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
  await sql`CREATE TABLE IF NOT EXISTS coupons (
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
  await sql`CREATE TABLE IF NOT EXISTS coupon_usages (
    id TEXT PRIMARY KEY,
    coupon_code TEXT REFERENCES coupons(code) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    discount INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coupon_code, user_id, order_id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS carts (
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
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sql = getSql();
    await ensureTables(sql);
    const orders = await sql`SELECT * FROM orders WHERE user_id=${userId} ORDER BY created_at DESC`;
    const result = [];
    for (const o of orders as any[]) {
      const items = await sql`SELECT * FROM order_items WHERE order_id=${o.id}`;
      result.push({ ...o, items });
    }
    return NextResponse.json({ orders: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sql = getSql();
    await ensureTables(sql);
    const body = await req.json();
    const { customer_name, phone, address, latitude, longitude, items, coupon_code, offer_id, payment_method, notes } = body;

    if (!customer_name || !phone || !address) return NextResponse.json({ error: "customer_name, phone, address required" }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "items required" }, { status: 400 });

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const it of items) {
      const { menu_item_id, combo_id, variant, quantity } = it;
      const qty = Number(quantity) || 1;
      if (!menu_item_id && !combo_id) return NextResponse.json({ error: "Each item needs menu_item_id or combo_id" }, { status: 400 });
      if (qty < 1) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });

      if (menu_item_id) {
        const rows: any[] = await sql`SELECT id, name, half_price, full_price, single_price, price_type, is_available FROM menu_items WHERE id=${menu_item_id} LIMIT 1`;
        if (!rows.length) return NextResponse.json({ error: `Menu item ${menu_item_id} not found` }, { status: 404 });
        const m = rows[0];
        if (!m.is_available) return NextResponse.json({ error: `Item ${m.name} not available` }, { status: 400 });
        let unitPrice: number;
        if (m.price_type === "half_full") {
          if (variant === "half") unitPrice = m.half_price;
          else if (variant === "full") unitPrice = m.full_price;
          else return NextResponse.json({ error: `Variant half/full required for ${m.name}` }, { status: 400 });
        } else {
          unitPrice = m.single_price;
        }
        if (unitPrice == null) return NextResponse.json({ error: `Price missing for ${m.name}` }, { status: 500 });
        subtotal += unitPrice * qty;
        validatedItems.push({ menu_item_id, combo_id: null, name: m.name, variant: variant || null, quantity: qty, unit_price: unitPrice, total_price: unitPrice * qty });
      } else {
        const rows: any[] = await sql`SELECT id, name, price, is_active FROM combos WHERE id=${combo_id} LIMIT 1`;
        if (!rows.length) return NextResponse.json({ error: `Combo ${combo_id} not found` }, { status: 404 });
        const c = rows[0];
        if (!c.is_active) return NextResponse.json({ error: `Combo ${c.name} not active` }, { status: 400 });
        const unitPrice = c.price;
        subtotal += unitPrice * qty;
        validatedItems.push({ menu_item_id: null, combo_id, name: c.name, variant: variant || null, quantity: qty, unit_price: unitPrice, total_price: unitPrice * qty });
      }
    }

    let discount = 0;
    let couponCode = coupon_code || null;

    if (couponCode) {
      const coupons: any[] = await sql`SELECT * FROM coupons WHERE code=${couponCode} LIMIT 1`;
      if (!coupons.length) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
      const cp = coupons[0];
      if (!cp.is_active) return NextResponse.json({ error: "Coupon inactive" }, { status: 400 });
      if (cp.start_date && new Date(cp.start_date) > new Date()) return NextResponse.json({ error: "Coupon not yet active" }, { status: 400 });
      if (cp.expiry_date && new Date(cp.expiry_date) < new Date()) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
      if (cp.minimum_order && subtotal < cp.minimum_order) return NextResponse.json({ error: `Minimum order ${cp.minimum_order} required` }, { status: 400 });
      if (cp.usage_limit && cp.used_count >= cp.usage_limit) return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      if (cp.per_user_limit) {
        const usages: any[] = await sql`SELECT COUNT(*)::int as cnt FROM coupon_usages WHERE coupon_code=${couponCode} AND user_id=${userId}`;
        if (usages[0].cnt >= cp.per_user_limit) return NextResponse.json({ error: "Coupon per user limit reached" }, { status: 400 });
      }
      if (cp.discount_type === "flat") discount = cp.discount_value;
      else if (cp.discount_type === "percent") {
        discount = Math.floor((subtotal * cp.discount_value) / 100);
        if (cp.maximum_discount && discount > cp.maximum_discount) discount = cp.maximum_discount;
      }
      if (discount > subtotal) discount = subtotal;
    }

    const deliveryFee = 0;
    const total = subtotal - discount + deliveryFee;
    const orderId = genId("ord");
    const pm = payment_method || "cod";

    await sql`
      INSERT INTO orders (id, user_id, customer_name, phone, address, latitude, longitude, subtotal, discount, delivery_fee, total, coupon_code, offer_id, payment_method, payment_status, order_status, notes)
      VALUES (${orderId}, ${userId}, ${customer_name}, ${phone}, ${address}, ${latitude || null}, ${longitude || null}, ${subtotal}, ${discount}, ${deliveryFee}, ${total}, ${couponCode}, ${offer_id || null}, ${pm}, 'pending', 'PENDING', ${notes || null})
    `;

    for (const vi of validatedItems) {
      const itemId = genId("oi");
      await sql`
        INSERT INTO order_items (id, order_id, menu_item_id, combo_id, name, variant, quantity, unit_price, total_price)
        VALUES (${itemId}, ${orderId}, ${vi.menu_item_id}, ${vi.combo_id}, ${vi.name}, ${vi.variant}, ${vi.quantity}, ${vi.unit_price}, ${vi.total_price})
      `;
    }

    if (couponCode && discount > 0) {
      await sql`UPDATE coupons SET used_count = used_count + 1 WHERE code=${couponCode}`;
      const usageId = genId("cu");
      await sql`INSERT INTO coupon_usages (id, coupon_code, user_id, order_id, discount) VALUES (${usageId}, ${couponCode}, ${userId}, ${orderId}, ${discount})`;
    }

    await sql`DELETE FROM carts WHERE user_id=${userId}`;

    const order = (await sql`SELECT * FROM orders WHERE id=${orderId} LIMIT 1`)[0] as any;
    const orderItems = await sql`SELECT * FROM order_items WHERE order_id=${orderId}`;

    return NextResponse.json({ success: true, order: { ...order, items: orderItems }, subtotal, discount, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
