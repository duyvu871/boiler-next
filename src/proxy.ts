import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Security headers applied to all responses
 */
const securityHeaders = new Headers({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'X-DNS-Prefetch-Control': 'on',
});

/**
 * Routes that require authentication
 */
const protectedPaths = ['/dashboard', '/admin', '/settings', '/profile'];

/**
 * Routes that should NOT be protected (public routes)
 */
const publicPaths = [
  '/auth',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/public',
];

/**
 * Check if the path matches any of the given prefixes
 */
function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security headers to all responses
  const response = NextResponse.next();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Skip auth check for public routes and static assets
  if (matchesPath(pathname, publicPaths)) {
    return response;
  }

  // Check authentication for protected routes
  if (matchesPath(pathname, protectedPaths)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is suspended or inactive
    if (token.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/auth/suspended', request.url));
    }

    if (token.status === 'INACTIVE') {
      return NextResponse.redirect(new URL('/auth/inactive', request.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Protect API routes (except /api/auth)
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
