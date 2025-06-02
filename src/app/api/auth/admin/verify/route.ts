import { NextResponse } from 'next/server'
import { verifyAdminCredentials } from '@/utils/portCheck'

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.username || !body.password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }
        
        if (verifyAdminCredentials(body)) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Admin authentication error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
