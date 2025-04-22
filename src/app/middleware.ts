// src/app/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (protectedRoutes.includes(path)) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      // Optionally, you could attach user information to the request for later use
      // request.headers.set('userId', decoded.userId);
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: protectedRoutes,
};