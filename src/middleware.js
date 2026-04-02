import { NextResponse } from 'next/server'

export function middleware(request) {
  // DEMO MODE: middleware is disabled — all routes are accessible
  // Re-enable the auth checks below when connecting a real backend
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/pod/:path*', '/profile/:path*', '/notifications/:path*', '/premium/:path*', '/project/:path*', '/marketplace/:path*', '/auth/:path*', '/leaderboard/:path*'],
}
