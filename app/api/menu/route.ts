import { NextResponse } from 'next/server';
import { storage } from '@/data/storage';

export async function GET() {
  try {
    const categories = storage.getMenu();
    const allItems = categories.flatMap(c => c.items);
    return NextResponse.json({ categories, allItems }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch {
    return NextResponse.json({ categories: [], allItems: [] });
  }
}
