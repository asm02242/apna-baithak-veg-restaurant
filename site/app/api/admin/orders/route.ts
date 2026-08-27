import { NextRequest, NextResponse } from 'next/server';
import { storage, Order, getNextId } from '@/data/storage';

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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  let orders = storage.getOrders();
  
  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }
  
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return NextResponse.json({ orders: orders.slice(0, limit) });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, order } = data;

    const orders = storage.getOrders();

    if (action === 'updateStatus') {
      const updated = orders.map(o => 
        o.id === data.id ? { ...o, status: data.status, updatedAt: new Date().toISOString() } : o
      );
      storage.saveOrders(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'add') {
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newOrder, ...orders];
      storage.saveOrders(updated);
      return NextResponse.json({ success: true, order: newOrder });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}