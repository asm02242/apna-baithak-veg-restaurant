import { NextRequest, NextResponse } from 'next/server';
import { storage, MenuCategory, MenuItem, getNextId } from '@/data/storage';

async function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) return null;
  const adminId = sessionToken.split('_')[1];
  const admins = await storage.getAdminsAsync();
  return admins.find(a => a.id === adminId);
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = await storage.getMenuAsync();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await request.json();
    const { categoryId } = data;
    const categories = await storage.getMenuAsync();
    if (data.action === 'addCategory') {
      const newCategory = { id: getNextId('cat'), name: data.name, icon: data.icon || '🍽️', items: [] as MenuItem[] };
      const updated = [...categories, newCategory];
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true, category: newCategory });
    }
    if (data.action === 'updateCategory') {
      const updated = categories.map(c => c.id === data.id ? { ...c, ...data } : c);
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true });
    }
    if (data.action === 'deleteCategory') {
      const updated = categories.filter(c => c.id !== data.id);
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true });
    }
    if (data.action === 'addItem') {
      const cat = categories.find(c => c.id === categoryId);
      if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      const newItem: MenuItem = { id: getNextId('item'), name: data.name, category: cat.name, categoryId: cat.id, price: data.price, half: data.half, full: data.full, rating: data.rating || 4.5, bestSeller: data.bestSeller || false, veg: true, image: data.image, description: data.description, isAvailable: data.isAvailable !== false };
      const updated = categories.map(c => c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c);
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true, item: newItem });
    }
    if (data.action === 'updateItem') {
      const updated = categories.map(c => ({ ...c, items: c.items.map(i => i.id === data.id ? { ...i, ...data } : i) }));
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true });
    }
    if (data.action === 'deleteItem') {
      const updated = categories.map(c => ({ ...c, items: c.items.filter(i => i.id !== data.id) }));
      await storage.saveMenuAsync(updated);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const categories = await storage.getMenuAsync();
  if (type === 'category') {
    const updated = categories.filter(c => c.id !== id);
    await storage.saveMenuAsync(updated);
  } else if (type === 'item') {
    const updated = categories.map(c => ({ ...c, items: c.items.filter(i => i.id !== id) }));
    await storage.saveMenuAsync(updated);
  }
  return NextResponse.json({ success: true });
}
