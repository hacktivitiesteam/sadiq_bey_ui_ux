import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_TOKEN_COOKIE } from './lib/constants';

const protectedRoutes = ['/home', '/profile', '/scoreboard', '/tour', '/communication-aid'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');

  // Handle Admin routes
  if (isAdminRoute && pathname !== '/admin/login' && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (pathname === '/admin/login' && token) {
     return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Handle User routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
