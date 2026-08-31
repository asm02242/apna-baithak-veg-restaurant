import { NextRequest, NextResponse } from 'next/server';
import { storage, BulkOrder, getNextId } from '@/data/storage';

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
  const bulkOrders = await storage.getBulkOrdersAsync();
  return NextResponse.json({ bulkOrders });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await request.json();
    const bulkOrders = await storage.getBulkOrdersAsync();
    if (data.action === 'add') {
      const newBulkOrder: BulkOrder = { id: getNextId('bulk'), name: data.name, phone: data.phone, email: data.email, company: data.company, items: data.items, quantity: data.quantity, deliveryDate: data.deliveryDate, message: data.message, status: 'new', createdAt: new Date().toISOString() };
      await storage.saveBulkOrdersAsync([...bulkOrders, newBulkOrder]);
      return NextResponse.json({ success: true, bulkOrder: newBulkOrder });
    }
    if (data.action === 'update') {
      const updated = bulkOrders.map(b => b.id !== data.id ? b : ({ ...b, ...(({ action, bulkOrder, id, ...rest }: any) => rest)(data) } as BulkOrder));
      await storage.saveBulkOrdersAsync(updated);
      return NextResponse.json({ success: true });
    }
    if (data.action === 'updateStatus') {
      await storage.saveBulkOrdersAsync(bulkOrders.map(b => b.id === data.id ? { ...b, status: data.status } : b));
      return NextResponse.json({ success: true });
    }
    if (data.action === 'quote') {
      await storage.saveBulkOrdersAsync(bulkOrders.map(b => b.id !== data.id ? b : { ...b, quotedPrice: data.quotedPrice, status: 'quoted' as const }));
      return NextResponse.json({ success: true });
    }
    if (data.action === 'delete') {
      await storage.saveBulkOrdersAsync(bulkOrders.filter(b => b.id !== data.id));
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
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const bulkOrders = await storage.getBulkOrdersAsync();
  await storage.saveBulkOrdersAsync(bulkOrders.filter(b => b.id !== id));
  return NextResponse.json({ success: true });
}
