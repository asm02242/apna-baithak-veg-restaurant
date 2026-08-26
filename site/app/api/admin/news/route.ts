import { NextRequest, NextResponse } from 'next/server';
import { storage, NewsItem, getNextId } from '@/data/storage';

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
  
  const news = storage.getNews();
  return NextResponse.json({ news });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { action, news } = data;

    const newsList = storage.getNews();

    if (action === 'add') {
      const newNews = {
        id: getNextId('news'),
        title: data.title,
        content: data.content,
        image: data.image,
        active: data.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newNews, ...newsList];
      storage.saveNews(updated);
      return NextResponse.json({ success: true, news: newNews });
    }

    if (action === 'update') {
      const updated = newsList.map(n => n.id === data.id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n);
      storage.saveNews(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const updated = newsList.map(n => n.id === data.id ? { ...n, active: data.active, updatedAt: new Date().toISOString() } : n);
      storage.saveNews(updated);
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

  const newsList = storage.getNews();
  const updated = newsList.filter(n => n.id !== id);
  storage.saveNews(updated);
  return NextResponse.json({ success: true });
}