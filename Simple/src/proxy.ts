import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/auth/sign-in',
  '/auth/register-company',
  '/auth/reset-password',
  '/auth/forgot-password',
]

const LOCK_SCREENS = [
  '/subscription/trial-expired',
  '/subscription/grace',
  '/subscription/suspended',
  '/subscription/cancelled',
  '/subscription/change-plan',
]

const LOCK_ROUTES: Record<string, string> = {
  trial_expired: '/subscription/trial-expired',
  suspended:     '/subscription/suspended',
  cancelled:     '/subscription/cancelled',
  grace:         '/subscription/grace',
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Allow Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // 2. Allow public auth pages
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 3. Allow lock screens — prevents redirect loops
  if (LOCK_SCREENS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 4. Read token from cookie
  const token = req.cookies.get('accessToken')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // 5. Check subscription status
  const apiBase =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:5100'

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${apiBase}/api/subscription/status`, {
      method: 'GET',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache:  'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeout)

    // Token invalid or expired — clear cookie and send to login
    if (res.status === 401) {
      const response = NextResponse.redirect(new URL('/auth/sign-in', req.url))
      response.cookies.delete('accessToken')
      return response
    }

    // Subscription endpoint not available — allow through
    if (!res.ok) {
      return NextResponse.next()
    }

    const sub = await res.json()

    const lockPath = LOCK_ROUTES[sub.status]

    if (lockPath) {
      if (sub.status === 'grace') {
        // Grace is special — show warning page once per session
        // After user clicks "Continue to dashboard" a cookie is set
        // and they can navigate freely for the rest of the session
        const acknowledged = req.cookies.get('graceAcknowledged')?.value

        if (acknowledged === 'true') {
          // User already acknowledged — allow through
          return NextResponse.next()
        }

        // Not yet acknowledged — show grace warning page
        if (!pathname.startsWith('/subscription/grace')) {
          return NextResponse.redirect(new URL('/subscription/grace', req.url))
        }
      } else {
        // All other blocked statuses — always redirect to lock screen
        if (!pathname.startsWith(lockPath)) {
          return NextResponse.redirect(new URL(lockPath, req.url))
        }
      }
    }

  } catch {
    // API unreachable or timeout — allow through
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}