import { NextResponse } from "next/server";
import { storage } from "@/data/storage";

export async function GET() {
  try {
    // First try Neon coupons table if DATABASE_URL is set
    const conn = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (conn) {
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(conn);
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
        const rows: any[] = await sql`SELECT code, title, description, discount_type as "discountType", discount_value as "discountValue", minimum_order as "minimumOrder", maximum_discount as "maximumDiscount", expiry_date as "expiryDate", start_date as "startDate", is_active as "isActive", used_count as "usedCount", usage_limit as "usageLimit" FROM coupons WHERE is_active=true ORDER BY created_at DESC`;
        // Filter by expiry/start dates
        const now = new Date();
        const active = rows.filter((r) => {
          if (r.expiryDate && new Date(r.expiryDate) < now) return false;
          if (r.startDate && new Date(r.startDate) > now) return false;
          return true;
        });
        return NextResponse.json({ coupons: active }, { headers: { "Cache-Control": "no-store, max-age=0" } });
      } catch {}
    }
    // Fallback: derive coupon-like objects from offers (so UI always has something if coupons table empty)
    const offers = await storage.getOffersAsync();
    const activeOffers = offers.filter((o: any) => o.active !== false);
    // Return empty coupons if none in DB, page will show offers separately
    return NextResponse.json({ coupons: [], offers: activeOffers }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ coupons: [] });
  }
}
