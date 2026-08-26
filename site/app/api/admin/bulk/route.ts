import { NextRequest, NextResponse } from 'next/server';
import { storage, BulkOrder, getNextId } from '@/data/storage';

function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) return null;
  const adminId = sessionToken.split('_')[1];
  const admins = storage.getAdmins();
  return admins.find(a => a.id === adminId);
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bulkOrders = storage.getBulkOrders();
  return NextResponse.json({ bulkOrders });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, bulkOrder } = data;

    const bulkOrders = storage.getBulkOrders();

    if (action === 'add') {
      const newBulkOrder: BulkOrder = {
        id: getNextId('bulk'),
        name: data.name,
        phone: data.phone,
        email: data.email,
        company: data.company,
        items: data.items,
        quantity: data.quantity,
        deliveryDate: data.deliveryDate,
        message: data.message,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      const updated = [...bulkOrders, newBulkOrder];
      storage.saveBulkOrders(updated);
      return NextResponse.json({ success: true, bulkOrder: newBulkOrder });
    }

    if (action === 'update') {
      const updated = bulkOrders.map(b => {
        if (b.id !== data.id) return b;
        const { action, bulkOrder, id, ...rest } = data;
        return { ...b, ...rest } as BulkOrder;
      });
      storage.saveBulkOrders(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'updateStatus') {
      const updated = bulkOrders.map(b => b.id === data.id ? { ...b, status: data.status } : b);
      storage.saveBulkOrders(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'quote') {
      const updated = bulkOrders.map(b => {
        if (b.id !== data.id) return b;
        return { ...b, quotedPrice: data.quotedPrice, status: 'quoted' as const };
      });
      storage.saveBulkOrders(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const updated = bulkOrders.filter(b => b.id !== data.id);
      storage.saveBulkOrders(updated);
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

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const bulkOrders = storage.getBulkOrders();
  const updated = bulkOrders.filter(b => b.id !== id);
  storage.saveBulkOrders(updated);

  return NextResponse.json({ success: true });
}