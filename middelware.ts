import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(request: NextRequest) {
  // Proxy ke Railway untuk path /api/*
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const path = request.nextUrl.pathname.replace('/api/', '');
    const searchParams = request.nextUrl.search;
    
    // Buat URL ke Railway
    const railwayUrl = new URL(
      path + searchParams,
      'https://keretaapi-production.up.railway.app/api/'
    );
    // Clone request headers
    const headers = new Headers(request.headers);
    
    // Response rewrite ke Railway
    return NextResponse.rewrite(railwayUrl, {
      request: {
        headers: headers,
      },
    });
  }
  return NextResponse.next();
}
export const config = {
  matcher: '/api/:path*',
};
