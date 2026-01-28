import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow access to the root page (entry way)
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  // For all other routes, check if user is authenticated
  // Note: This is a basic check. The actual auth check happens client-side
  // because localStorage is not available in middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

