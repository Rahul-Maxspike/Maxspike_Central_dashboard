import { NextResponse } from 'next/server'
import { services, checkHtmlResponse } from '@/utils/portCheck'

// In-memory store for service statuses
let serviceStatuses = services

export async function GET() {
    // Check all non-external services
    const updatedServices = await Promise.all(
        serviceStatuses.map(async (service) => {
            if (service.isExternal) return service

            const isOnline = await checkHtmlResponse(service.url, service.port, service.path)
            return {
                ...service,
                isOnline,
                lastChecked: new Date().toISOString()
            }
        })
    )

    serviceStatuses = updatedServices
    return NextResponse.json(serviceStatuses)
}

export async function POST(request: Request) {
    const { serviceName, isOnline } = await request.json()

    serviceStatuses = serviceStatuses.map(service =>
        service.name === serviceName
            ? {
                ...service,
                isOnline,
                lastChecked: new Date().toISOString()
            }
            : service
    )

    return NextResponse.json({ success: true, services: serviceStatuses })
} 