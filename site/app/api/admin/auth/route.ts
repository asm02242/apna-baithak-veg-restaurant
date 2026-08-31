import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/data/storage';

// Simple in-memory rate limit: 5 fails / 15min per IP
const fails = globalThis as unknown as { __ADMIN_FAILS__?: Map<string, { count: number; until: number }> };
if (!fails.__ADMIN_FAILS__) fails.__ADMIN_FAILS__ = new Map();
const failMap = fails.__ADMIN_FAILS__!;

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const { action, username, password } = await request.json();

    if (action === 'login') {
      const ip = getIp(request);
      const rec = failMap.get(ip);
      if (rec && rec.until > Date.now()) {
        const wait = Math.ceil((rec.until - Date.now()) / 1000);
        return NextResponse.json({ error: `Too many attempts. Try again in ${wait}s` }, { status: 429 });
      }
      // Credentials from env (secure) with fallback for local dev
      const envUser = process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME || '';
      const envPass = process.env.ADMIN_PASSWORD || '';
      let admin: any = null;
      if (envUser && envPass) {
        if (username === envUser && password === envPass) {
          const admins = await storage.getAdminsAsync();
          admin = admins.find(a => a.username === envUser) || { id: 'admin-1', username: envUser, role: 'admin' as const };
        }
      } else {
        const admins = await storage.getAdminsAsync();
        admin = admins.find(a => a.username === username && a.password === password);
      }
      if (!admin) {
        const cur = failMap.get(ip) || { count: 0, until: 0 };
        cur.count += 1;
        if (cur.count >= 5) cur.until = Date.now() + 15 * 60 * 1000;
        failMap.set(ip, cur);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      failMap.delete(ip);

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