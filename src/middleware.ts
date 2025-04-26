import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/auth')) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const { exp } = jwt.decode(token) as { exp: number };
            if (Date.now() >= exp * 1000) {
                throw new Error('Token expired');
            }
        } catch (error) {
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('authToken');
            console.log('middleware error checking token expiration: ', error);
            return response
        }
    }

    return NextResponse.next();
}