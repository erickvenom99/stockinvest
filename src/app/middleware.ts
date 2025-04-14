// src/app/middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define the secret key (should match the one used in /api/login)
const JWT_SECRET = process.env.JWT_SECRET as string;

// Define the routes that need protection
const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the requested route is protected
  if (protectedRoutes.includes(path)) {
    // Get the JWT from the request headers (or cookies, if you choose that)
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // If no Authorization header or invalid format, return an error
      return NextResponse.redirect(new URL('/auth/login', request.url)); // Redirect to login
    }

    const token = authHeader.split(' ')[1]; // Extract the token part

    try {
      // Verify the JWT
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; // Type assertion

      // Optionally, you could attach user information to the request for later use in your page component
      // request.headers.set('userId', decoded.userId);

      return NextResponse.next(); // If the token is valid, continue to the requested route
    } catch (error) {
      // If the token is invalid (expired, signature mismatch, etc.), return an error
      console.error('JWT verification error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url)); // Redirect to login
    }
  }

  // If the route is not protected, allow the request to proceed
  return NextResponse.next();
}

// See the Next.js documentation for more information about the 'matcher'
export const config = {
  matcher: protectedRoutes, // Apply this middleware to the specified routes
};