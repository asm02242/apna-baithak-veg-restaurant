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
  await sql`CREATE TABLE IF NOT EXISTS wishlists (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, menu_item_id)
  )`;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sql = getSql();
    await ensureTables(sql);
    const wishlists = await sql`
      SELECT w.*, mi.name, mi.image_url, mi.is_available, mi.is_veg, mi.half_price, mi.full_price, mi.single_price, mi.price_type
      FROM wishlists w
      LEFT JOIN menu_items mi ON mi.id = w.menu_item_id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;
    return NextResponse.json({ wishlists });
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
    const { action, menu_item_id } = body;
    if (!menu_item_id && action !== "clear") {
      return NextResponse.json({ error: "menu_item_id required" }, { status: 400 });
    }
    if (menu_item_id) {
      const rows: any[] = await sql`SELECT id FROM menu_items WHERE id=${menu_item_id} LIMIT 1`;
      if (!rows.length) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    if (action === "toggle") {
      const existing: any[] = await sql`SELECT menu_item_id FROM wishlists WHERE user_id=${userId} AND menu_item_id=${menu_item_id} LIMIT 1`;
      if (existing.length) {
        await sql`DELETE FROM wishlists WHERE user_id=${userId} AND menu_item_id=${menu_item_id}`;
        return NextResponse.json({ success: true, action: "removed" });
      } else {
        await sql`INSERT INTO wishlists (user_id, menu_item_id) VALUES (${userId}, ${menu_item_id}) ON CONFLICT DO NOTHING`;
        return NextResponse.json({ success: true, action: "added" });
      }
    }
    if (action === "add") {
      await sql`INSERT INTO wishlists (user_id, menu_item_id) VALUES (${userId}, ${menu_item_id}) ON CONFLICT DO NOTHING`;
      return NextResponse.json({ success: true });
    }
    if (action === "remove") {
      await sql`DELETE FROM wishlists WHERE user_id=${userId} AND menu_item_id=${menu_item_id}`;
      return NextResponse.json({ success: true });
    }
    if (action === "clear") {
      await sql`DELETE FROM wishlists WHERE user_id=${userId}`;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
