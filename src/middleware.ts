import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Function to check if the request is from the same network
function isSameNetwork(req: NextRequest): boolean {
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown'

    // For development, we'll consider localhost as same network
    if (process.env.NODE_ENV === 'development') {
        return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost'
    }
    // In production, you might want to implement more sophisticated network checking
    // This is a simplified version
    return ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
}

export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.has('auth_token')
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isSameNetworkCheck = isSameNetwork(request)

    // If on login page and already logged in, redirect to home
    if (isLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If not on login page and not logged in and not on same network, redirect to login
    if (!isLoginPage && !isLoggedIn && !isSameNetworkCheck) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 