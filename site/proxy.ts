import { NextResponse, NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSql() {
  return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  return !!token && token.startsWith('admin_');
}
async function verifyDeliveryToken(token: string): Promise<boolean> {
  return !!token && token.startsWith('delivery_');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isApiAdminAuth = pathname === '/api/admin/auth';
  const isApiAdmin = pathname.startsWith('/api/admin/');
  const isDelivery = pathname.startsWith('/delivery');
  const isDeliveryLogin = pathname === '/delivery/login' || pathname.startsWith('/delivery/login/');
  const isApiDeliveryAuth = pathname === '/api/delivery/auth';
  const isApiDelivery = pathname.startsWith('/api/delivery/');

  if (isAdminLogin || isApiAdminAuth || isDeliveryLogin || isApiDeliveryAuth) return NextResponse.next();

  if (isAdmin || isApiAdmin) {
    const token = request.cookies.get('admin_session')?.value || '';
    const customerToken = request.cookies.get('customer_session')?.value || '';
    // Block customer from admin even if they have delivery token
    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      if (isApiAdmin) return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isDelivery) {
    const token = request.cookies.get('delivery_session')?.value || '';
    if (!(await verifyDeliveryToken(token))) {
      const url = request.nextUrl.clone();
      url.pathname = '/delivery/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  if (isApiDelivery) {
    const dToken = request.cookies.get('delivery_session')?.value || '';
    const aToken = request.cookies.get('admin_session')?.value || '';
    const isDeliveryValid = await verifyDeliveryToken(dToken);
    const isAdminValid = await verifyAdminToken(aToken);
    if (!isDeliveryValid && !isAdminValid) {
      return NextResponse.json({ error: 'Delivery or Admin auth required' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/delivery/:path*', '/api/delivery/:path*'],
};