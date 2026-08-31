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
function genId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
async function ensureTables(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS addresses (
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
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sql = getSql();
    await ensureTables(sql);
    const addresses = await sql`SELECT * FROM addresses WHERE user_id=${userId} ORDER BY is_default DESC, created_at DESC`;
    return NextResponse.json({ addresses });
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

    if (action === "add") {
      const { address, landmark, city, state, pincode, latitude, longitude, address_type, is_default, name, phone } = body;
      if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
      const id = body.id || genId();
      const isDefault = Boolean(is_default);
      if (isDefault) {
        await sql`UPDATE addresses SET is_default=false WHERE user_id=${userId}`;
      }
      await sql`
        INSERT INTO addresses (id, user_id, name, phone, address, landmark, city, state, pincode, latitude, longitude, address_type, is_default)
        VALUES (${id}, ${userId}, ${name || null}, ${phone || null}, ${address}, ${landmark || null}, ${city || null}, ${state || null}, ${pincode || null}, ${latitude || null}, ${longitude || null}, ${address_type || 'home'}, ${isDefault})
      `;
      return NextResponse.json({ success: true, id });
    }

    if (action === "update") {
      const { id, address, landmark, city, state, pincode, latitude, longitude, address_type, is_default, name, phone } = body;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const rows: any[] = await sql`SELECT id FROM addresses WHERE id=${id} AND user_id=${userId} LIMIT 1`;
      if (!rows.length) return NextResponse.json({ error: "Address not found" }, { status: 404 });
      const isDefault = is_default === true ? true : is_default === false ? false : null;
      if (isDefault === true) {
        await sql`UPDATE addresses SET is_default=false WHERE user_id=${userId}`;
      }
      await sql`
        UPDATE addresses SET
          name = COALESCE(${name ?? null}, name),
          phone = COALESCE(${phone ?? null}, phone),
          address = COALESCE(${address ?? null}, address),
          landmark = COALESCE(${landmark ?? null}, landmark),
          city = COALESCE(${city ?? null}, city),
          state = COALESCE(${state ?? null}, state),
          pincode = COALESCE(${pincode ?? null}, pincode),
          latitude = COALESCE(${latitude ?? null}, latitude),
          longitude = COALESCE(${longitude ?? null}, longitude),
          address_type = COALESCE(${address_type ?? null}, address_type),
          is_default = COALESCE(${isDefault}, is_default)
        WHERE id=${id} AND user_id=${userId}
      `;
      if (address !== undefined) await sql`UPDATE addresses SET address=${address} WHERE id=${id} AND user_id=${userId}`;
      if (landmark !== undefined) await sql`UPDATE addresses SET landmark=${landmark} WHERE id=${id} AND user_id=${userId}`;
      if (city !== undefined) await sql`UPDATE addresses SET city=${city} WHERE id=${id} AND user_id=${userId}`;
      if (state !== undefined) await sql`UPDATE addresses SET state=${state} WHERE id=${id} AND user_id=${userId}`;
      if (pincode !== undefined) await sql`UPDATE addresses SET pincode=${pincode} WHERE id=${id} AND user_id=${userId}`;
      if (name !== undefined) await sql`UPDATE addresses SET name=${name} WHERE id=${id} AND user_id=${userId}`;
      if (phone !== undefined) await sql`UPDATE addresses SET phone=${phone} WHERE id=${id} AND user_id=${userId}`;
      if (latitude !== undefined) await sql`UPDATE addresses SET latitude=${latitude} WHERE id=${id} AND user_id=${userId}`;
      if (longitude !== undefined) await sql`UPDATE addresses SET longitude=${longitude} WHERE id=${id} AND user_id=${userId}`;
      if (address_type !== undefined) await sql`UPDATE addresses SET address_type=${address_type} WHERE id=${id} AND user_id=${userId}`;
      if (is_default !== undefined) await sql`UPDATE addresses SET is_default=${Boolean(is_default)} WHERE id=${id} AND user_id=${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await sql`DELETE FROM addresses WHERE id=${id} AND user_id=${userId}`;
      return NextResponse.json({ success: true });
    }

    if (action === "setDefault") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const rows: any[] = await sql`SELECT id FROM addresses WHERE id=${id} AND user_id=${userId} LIMIT 1`;
      if (!rows.length) return NextResponse.json({ error: "Address not found" }, { status: 404 });
      await sql`UPDATE addresses SET is_default=false WHERE user_id=${userId}`;
      await sql`UPDATE addresses SET is_default=true WHERE id=${id} AND user_id=${userId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
