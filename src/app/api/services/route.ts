import { NextResponse } from 'next/server'
import { services as initialServices, checkHtmlResponse } from '@/utils/portCheck'

// In-memory store for service statuses
let serviceStatuses = initialServices

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
    const { action, service, serviceName } = await request.json()

    switch (action) {
        case 'add':
            if (!service.name || !service.url) {
                return NextResponse.json(
                    { error: 'Name and URL are required' },
                    { status: 400 }
                )
            }

            // Check if service with same name already exists
            if (serviceStatuses.some(s => s.name === service.name)) {
                return NextResponse.json(
                    { error: 'Service with this name already exists' },
                    { status: 400 }
                )
            }

            const newService = {
                ...service,
                port: service.port || 0,
                isManualStatus: true,
                isOnline: true,
                lastChecked: new Date().toISOString()
            }

            serviceStatuses = [...serviceStatuses, newService]
            break

        case 'delete':
            if (!serviceName) {
                return NextResponse.json(
                    { error: 'Service name is required' },
                    { status: 400 }
                )
            }

            serviceStatuses = serviceStatuses.filter(s => s.name !== serviceName)
            break

        default:
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
    }

    return NextResponse.json({ success: true, services: serviceStatuses })
} 