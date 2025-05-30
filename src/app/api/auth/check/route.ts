import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const isLoggedIn = request.cookies.has('auth_token')

    if (!isLoggedIn) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    return NextResponse.json({ authenticated: true })
} 