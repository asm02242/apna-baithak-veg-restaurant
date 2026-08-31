import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isApiAuth = pathname === '/api/admin/auth';

  if (!isAdmin || isLogin || isApiAuth) return NextResponse.next();

  const token = request.cookies.get('admin_session')?.value;
  if (!token || !token.startsWith('admin_')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
