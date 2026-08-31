import { NextRequest, NextResponse } from 'next/server';
import { storage, Offer, getNextId } from '@/data/storage';

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
  
  const offers = await storage.getOffersAsync();
  return NextResponse.json({ offers });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, offer } = data;

    const offers = await storage.getOffersAsync();

    if (action === 'add') {
      const newOffer = {
        id: getNextId('offer'),
        label: data.label,
        type: data.type,
        minOrder: data.minOrder,
        value: data.value,
        freeItemValue: data.freeItemValue,
        desc: data.desc,
        priority: data.priority,
        active: data.active !== false,
      };
      const updated = [...offers, newOffer];
      await storage.saveOffersAsync(updated);
      return NextResponse.json({ success: true, offer: newOffer });
    }

    if (action === 'update') {
      const updated = offers.map(o => o.id === data.id ? { ...o, ...data } : o);
      await storage.saveOffersAsync(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const updated = offers.map(o => o.id === data.id ? { ...o, active: data.active } : o);
      await storage.saveOffersAsync(updated);
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

  const offers = await storage.getOffersAsync();
  const updated = offers.filter(o => o.id !== id);
  await storage.saveOffersAsync(updated);
  return NextResponse.json({ success: true });
}