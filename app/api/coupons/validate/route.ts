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
async function ensureTables(sql: any) {
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
}

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    await ensureTables(sql);
    const body = await req.json();
    const code = body.code || body.coupon_code || body.couponCode;
    const cartTotal = Number(body.cartTotal ?? body.cart_total ?? body.subtotal ?? body.total ?? body.amount ?? 0);

    if (!code) return NextResponse.json({ error: "coupon code required" }, { status: 400 });

    const rows: any[] = await sql`SELECT * FROM coupons WHERE code=${code} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 404 });
    const cp = rows[0];

    if (!cp.is_active) return NextResponse.json({ valid: false, error: "Coupon is inactive" }, { status: 400 });
    if (cp.start_date && new Date(cp.start_date) > new Date()) return NextResponse.json({ valid: false, error: "Coupon not yet active" }, { status: 400 });
    if (cp.expiry_date && new Date(cp.expiry_date) < new Date()) return NextResponse.json({ valid: false, error: "Coupon expired" }, { status: 400 });
    if (cp.minimum_order && cartTotal < cp.minimum_order) return NextResponse.json({ valid: false, error: `Minimum order of ${cp.minimum_order} required`, minimum_order: cp.minimum_order }, { status: 400 });
    if (cp.usage_limit != null && cp.used_count >= cp.usage_limit) return NextResponse.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 });

    const userId = getUserId(req);
    if (userId && cp.per_user_limit) {
      const usages: any[] = await sql`SELECT COUNT(*)::int as cnt FROM coupon_usages WHERE coupon_code=${code} AND user_id=${userId}`;
      if (usages[0].cnt >= cp.per_user_limit) return NextResponse.json({ valid: false, error: "Per user limit reached" }, { status: 400 });
    }

    let discount = 0;
    if (cp.discount_type === "flat") discount = cp.discount_value;
    else if (cp.discount_type === "percent") {
      discount = Math.floor((cartTotal * cp.discount_value) / 100);
      if (cp.maximum_discount != null && discount > cp.maximum_discount) discount = cp.maximum_discount;
    }
    if (discount > cartTotal) discount = cartTotal;

    return NextResponse.json({
      valid: true,
      code: cp.code,
      discount,
      discount_type: cp.discount_type,
      discount_value: cp.discount_value,
      maximum_discount: cp.maximum_discount,
      minimum_order: cp.minimum_order,
      title: cp.title,
      description: cp.description,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
