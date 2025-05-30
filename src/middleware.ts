import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Function to check if the request is from the same network
function isSameNetwork(req: NextRequest): boolean {
    const forwardedFor = req.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

    // For development, we'll consider localhost as same network
    if (process.env.NODE_ENV === 'development') {
        return true // Allow all requests in development
    }

    // List of trusted IP ranges
    const trustedRanges = [
        '192.168.',  // Private network
        '10.',       // Private network
        '172.16.',   // Private network
        '172.17.',
        '172.18.',
        '172.19.',
        '172.20.',
        '172.21.',
        '172.22.',
        '172.23.',
        '172.24.',
        '172.25.',
        '172.26.',
        '172.27.',
        '172.28.',
        '172.29.',
        '172.30.',
        '172.31.',
        '127.0.0.1', // Localhost
        '::1'        // IPv6 localhost
    ]

    // Check if the client IP is in any of the trusted ranges
    return trustedRanges.some(range => clientIp.startsWith(range))
}

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.has('auth_token')
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isSameNetworkCheck = isSameNetwork(request)
    const requireLoginForLocal = process.env.REQUIRE_LOGIN_FOR_LOCAL === 'true'

    // If on login page and already logged in, redirect to home
    if (isLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If not on login page and not logged in
    if (!isLoginPage && !isLoggedIn) {
        // If on same network and login not required for local, set auth token automatically
        if (isSameNetworkCheck && !requireLoginForLocal) {
            const response = NextResponse.next()
            response.cookies.set('auth_token', 'authenticated', {
                path: '/',
                maxAge: 86400 // 24 hours
            })
            return response
        }

        // If login is required or not on same network, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 