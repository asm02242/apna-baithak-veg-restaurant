import { NextRequest, NextResponse } from 'next/server';
import { storage, CustomerUser, getNextId } from '@/data/storage';

function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) return null;
  const adminId = sessionToken.split('_')[1];
  const admins = storage.getAdmins();
  return admins.find(a => a.id === adminId);
}

export async function GET\(request: NextRequest\) {
  const admin = await verifyAdmin(new NextRequest(new URL(request.url)));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customers = storage.getCustomers();
  return NextResponse.json({ customers });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(new NextRequest(new URL(request.url)));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, customer } = data;

    const customers = storage.getCustomers();

    if (action === 'add') {
      const newCustomer: CustomerUser = {
        id: getNextId('cust'),
        username: data.username,
        password: data.password,
        name: data.name,
        phone: data.phone,
        addresses: data.addresses || [],
        wishlist: [],
        favourites: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [...customers, newCustomer];
      storage.saveCustomers(updated);
      return NextResponse.json({ success: true, customer: newCustomer });
    }

    if (action === 'update') {
      const updated = customers.map(c => c.id === data.id ? { ...c, ...data } : c);
      storage.saveCustomers(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const updated = customers.filter(c => c.id !== data.id);
      storage.saveCustomers(updated);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}