import { NextResponse } from 'next/server';
import { storage } from '@/data/storage';

export async function GET() {
  try {
    const categories = await storage.getMenuAsync();
    const allItems = categories.flatMap((c: any) => c.items);
    return NextResponse.json({ categories, allItems }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch {
    return NextResponse.json({ categories: [], allItems: [] });
  }
}
