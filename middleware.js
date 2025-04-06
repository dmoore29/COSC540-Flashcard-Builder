import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { jwtVerify } from 'jose';

// Adjust this path to protect specific routes
const protectedRoutes = ['/dash', '/profile'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // If route is not protected, allow access
  if (!protectedRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch (err) {
    console.error('Invalid token:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}
