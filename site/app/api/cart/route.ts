import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL!;
  return neon(url);
}
function genId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function getUserId(req: NextRequest) {
  const token = req.cookies.get("customer_session")?.value;
  if (!token) return null;
  const parts = token.split("_");
  return parts.length > 1 ? parts[1] : null;
}
async function ensureTables(sql: any) {
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
    const carts = await sql`
      SELECT c.*,
        mi.name as menu_item_name, mi.image_url as menu_item_image, mi.is_available, mi.is_veg, mi.price_type, mi.half_price, mi.full_price, mi.single_price,
        co.name as combo_name, co.image_url as combo_image, co.price as combo_price, co.is_active as combo_active
      FROM carts c
      LEFT JOIN menu_items mi ON mi.id = c.menu_item_id
      LEFT JOIN combos co ON co.id = c.combo_id
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;
    return NextResponse.json({ carts });
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
    const { action } = body;

    if (action === "clear") {
      await sql`DELETE FROM carts WHERE user_id = ${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "remove") {
      const { id, menu_item_id, combo_id, variant } = body;
      if (id) {
        await sql`DELETE FROM carts WHERE id = ${id} AND user_id = ${userId}`;
      } else if (menu_item_id || combo_id) {
        const v = variant || null;
        if (menu_item_id) {
          await sql`DELETE FROM carts WHERE user_id=${userId} AND menu_item_id=${menu_item_id} AND COALESCE(variant,'')=COALESCE(${v},'')`;
        } else {
          await sql`DELETE FROM carts WHERE user_id=${userId} AND combo_id=${combo_id} AND COALESCE(variant,'')=COALESCE(${v},'')`;
        }
      } else {
        return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "update") {
      const { id, menu_item_id, combo_id, variant, quantity } = body;
      const qty = Number(quantity);
      if (!qty || qty < 1) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      if (id) {
        await sql`UPDATE carts SET quantity=${qty}, updated_at=NOW() WHERE id=${id} AND user_id=${userId}`;
      } else if (menu_item_id || combo_id) {
        const v = variant || null;
        if (menu_item_id) {
          await sql`UPDATE carts SET quantity=${qty}, updated_at=NOW() WHERE user_id=${userId} AND menu_item_id=${menu_item_id} AND COALESCE(variant,'')=COALESCE(${v},'')`;
        } else {
          await sql`UPDATE carts SET quantity=${qty}, updated_at=NOW() WHERE user_id=${userId} AND combo_id=${combo_id} AND COALESCE(variant,'')=COALESCE(${v},'')`;
        }
      } else {
        return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "add") {
      const { menu_item_id, combo_id, variant, quantity, price_snapshot } = body;
      const qty = Number(quantity) || 1;
      if (!menu_item_id && !combo_id) return NextResponse.json({ error: "menu_item_id or combo_id required" }, { status: 400 });
      if (menu_item_id && combo_id) return NextResponse.json({ error: "Provide only one of menu_item_id or combo_id" }, { status: 400 });

      let expectedPrice: number | null = null;

      if (menu_item_id) {
        const rows: any[] = await sql`SELECT id, half_price, full_price, single_price, price_type, is_available FROM menu_items WHERE id=${menu_item_id} LIMIT 1`;
        if (!rows.length) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
        const item = rows[0];
        if (!item.is_available) return NextResponse.json({ error: "Item not available" }, { status: 400 });
        if (item.price_type === "half_full") {
          if (variant === "half") expectedPrice = item.half_price;
          else if (variant === "full") expectedPrice = item.full_price;
          else return NextResponse.json({ error: "Variant half/full required" }, { status: 400 });
        } else {
          expectedPrice = item.single_price;
        }
        if (expectedPrice == null) return NextResponse.json({ error: "Price not found" }, { status: 500 });
        if (price_snapshot != null && Number(price_snapshot) !== Number(expectedPrice)) {
          return NextResponse.json({ error: "Price mismatch", expected: expectedPrice }, { status: 400 });
        }
      } else if (combo_id) {
        const rows: any[] = await sql`SELECT id, price, is_active FROM combos WHERE id=${combo_id} LIMIT 1`;
        if (!rows.length) return NextResponse.json({ error: "Combo not found" }, { status: 404 });
        const combo = rows[0];
        if (!combo.is_active) return NextResponse.json({ error: "Combo not active" }, { status: 400 });
        expectedPrice = combo.price;
        if (price_snapshot != null && Number(price_snapshot) !== Number(expectedPrice)) {
          return NextResponse.json({ error: "Price mismatch", expected: expectedPrice }, { status: 400 });
        }
      }

      const price = Number(price_snapshot ?? expectedPrice);
      const v = variant || null;
      const id = genId();

      const existing: any[] = menu_item_id
        ? await sql`SELECT id, quantity FROM carts WHERE user_id=${userId} AND menu_item_id=${menu_item_id} AND COALESCE(variant,'')=COALESCE(${v},'') LIMIT 1`
        : await sql`SELECT id, quantity FROM carts WHERE user_id=${userId} AND combo_id=${combo_id} AND COALESCE(variant,'')=COALESCE(${v},'') LIMIT 1`;

      if (existing.length) {
        const newQty = Number(existing[0].quantity) + qty;
        await sql`UPDATE carts SET quantity=${newQty}, price_snapshot=${price}, updated_at=NOW() WHERE id=${existing[0].id}`;
      } else {
        await sql`
          INSERT INTO carts (id, user_id, menu_item_id, combo_id, variant, quantity, price_snapshot)
          VALUES (${id}, ${userId}, ${menu_item_id || null}, ${combo_id || null}, ${v}, ${qty}, ${price})
          ON CONFLICT DO NOTHING
        `;
        const check: any[] = await sql`SELECT id FROM carts WHERE id=${id} LIMIT 1`;
        if (!check.length) {
          const fallback = menu_item_id
            ? await sql`SELECT id FROM carts WHERE user_id=${userId} AND menu_item_id=${menu_item_id} AND COALESCE(variant,'')=COALESCE(${v},'') LIMIT 1`
            : await sql`SELECT id FROM carts WHERE user_id=${userId} AND combo_id=${combo_id} AND COALESCE(variant,'')=COALESCE(${v},'') LIMIT 1`;
          if (!fallback.length) {
            await sql`INSERT INTO carts (id, user_id, menu_item_id, combo_id, variant, quantity, price_snapshot) VALUES (${id}, ${userId}, ${menu_item_id || null}, ${combo_id || null}, ${v}, ${qty}, ${price})`;
          }
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
