import { NextRequest, NextResponse } from 'next/server';
import { storage, Offer, getNextId } from '@/data/storage';

function verifyAdmin(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  if (!sessionToken) return null;
  const adminId = sessionToken.split('_')[1];
  const admins = storage.getAdmins();
  return admins.find(a => a.id === adminId);
}

export async function GET() {
  const admin = await verifyAdmin(new NextRequest(new URL(request.url)));
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const offers = storage.getOffers();
  return NextResponse.json({ offers });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, offer } = data;

    const offers = storage.getOffers();

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
      storage.saveOffers(updated);
      return NextResponse.json({ success: true, offer: newOffer });
    }

    if (action === 'update') {
      const updated = offers.map(o => o.id === data.id ? { ...o, ...data } : o);
      storage.saveOffers(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const updated = offers.map(o => o.id === data.id ? { ...o, active: data.active } : o);
      storage.saveOffers(updated);
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

  const offers = storage.getOffers();
  const updated = offers.filter(o => o.id !== id);
  storage.saveOffers(updated);
  return NextResponse.json({ success: true });
}