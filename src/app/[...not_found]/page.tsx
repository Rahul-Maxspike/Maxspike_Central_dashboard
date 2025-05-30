'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/')
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">Redirecting...</h1>
            </div>
        </div>
    )
} 