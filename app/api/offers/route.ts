import { NextResponse } from "next/server";
import { storage } from "@/data/storage";

export async function GET() {
  try {
    const offers = await storage.getOffersAsync();
    const active = offers.filter((o: any) => o.active !== false);
    return NextResponse.json({ offers: active }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ offers: [] });
  }
}
