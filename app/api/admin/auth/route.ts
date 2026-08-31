import { NextRequest, NextResponse } from 'next/server';
import { storage, AdminUser, getNextId } from '@/data/storage';

export async function POST(request: NextRequest) {
  try {
    const { action, username, password } = await request.json();

    if (action === 'login') {
      const admins = await storage.getAdminsAsync();
      const admin = admins.find(a => a.username === username && a.password === password);
      
      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const sessionToken = `admin_${admin.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      const response = NextResponse.json({ 
        success: true, 
        admin: { id: admin.id, username: admin.username, role: admin.role },
        sessionToken 
      });
      
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('admin_session');
      return response;
    }

    if (action === 'check') {
      const sessionToken = request.cookies.get('admin_session')?.value;
      if (!sessionToken) {
        return NextResponse.json({ authenticated: false });
      }
      const admins = await storage.getAdminsAsync();
      const adminId = sessionToken.split('_')[1];
      const admin = admins.find(a => a.id === adminId);
      
      if (!admin) {
        return NextResponse.json({ authenticated: false });
      }
      
      return NextResponse.json({ 
        authenticated: true, 
        admin: { id: admin.id, username: admin.username, role: admin.role }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}