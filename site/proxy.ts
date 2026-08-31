import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || !token.startsWith('admin_')) return false;
  
  try {
    const sql = getSql();
    const adminId = token.split('_')[1];
    if (!adminId) return false;
    
    const rows = await sql`SELECT id FROM admins WHERE id = ${adminId} LIMIT 1`;
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isApiAuth = pathname === '/api/admin/auth';
  const isApiAdmin = pathname.startsWith('/api/admin/');

  // Allow access to login page and auth API
  if (isLogin || isApiAuth) return NextResponse.next();

  // Check admin routes - both page routes and API routes
  if (isAdmin || isApiAdmin) {
    const token = request.cookies.get('admin_session')?.value;
    const isValid = await verifyAdminToken(token);
    
    if (!isValid) {
      // For API routes, return 401
      if (isApiAdmin) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
      }
      // For page routes, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};