import { NextRequest, NextResponse } from 'next/server';
import { storage, MenuCategory, MenuItem, getNextId } from '@/data/storage';

function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) return null;
  const adminId = sessionToken.split('_')[1];
  const admins = storage.getAdmins();
  return admins.find(a => a.id === adminId);
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(new NextRequest(new URL(request.url)));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const categories = storage.getMenu();
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, category, item, categoryId } = data;

    const categories = storage.getMenu();

    if (action === 'addCategory') {
      const newCategory = {
        id: getNextId('cat'),
        name: data.name,
        icon: data.icon || '🍽️',
        items: [],
      };
      const updated = [...categories, newCategory];
      storage.saveMenu(updated);
      return NextResponse.json({ success: true, category: newCategory });
    }

    if (action === 'updateCategory') {
      const updated = categories.map(c => c.id === data.id ? { ...c, ...data } : c);
      storage.saveMenu(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteCategory') {
      const updated = categories.filter(c => c.id !== data.id);
      storage.saveMenu(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'addItem') {
      const cat = categories.find(c => c.id === categoryId);
      if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      
      const newItem = {
        id: getNextId('item'),
        name: data.name,
        category: cat.name,
        categoryId: cat.id,
        price: data.price,
        half: data.half,
        full: data.full,
        rating: data.rating || 4.5,
        bestSeller: data.bestSeller || false,
        veg: true,
        image: data.image,
        description: data.description,
      };
      
      const updated = categories.map(c => 
        c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c
      );
      storage.saveMenu(updated);
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === 'updateItem') {
      const updated = categories.map(c => ({
        ...c,
        items: c.items.map(i => i.id === data.id ? { ...i, ...data } : i)
      }));
      storage.saveMenu(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteItem') {
      const updated = categories.map(c => ({
        ...c,
        items: c.items.filter(i => i.id !== data.id)
      }));
      storage.saveMenu(updated);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const categories = storage.getMenu();

  if (type === 'category') {
    const updated = categories.filter(c => c.id !== id);
    storage.saveMenu(updated);
  } else if (type === 'item') {
    const updated = categories.map(c => ({
      ...c,
      items: c.items.filter(i => i.id !== id)
    }));
    storage.saveMenu(updated);
  }

  return NextResponse.json({ success: true });
}