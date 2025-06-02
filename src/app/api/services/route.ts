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
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'add':
                if (!body.service.name || !body.service.url) {
                    return NextResponse.json(
                        { error: 'Name and URL are required' },
                        { status: 400 }
                    )
                }

                // Check if service with same name already exists
                if (serviceStatuses.some(s => s.name === body.service.name)) {
                    return NextResponse.json(
                        { error: 'Service with this name already exists' },
                        { status: 400 }
                    )
                }

                const newService = {
                    ...body.service,
                    port: body.service.port || 0,
                    isManualStatus: true,
                    isOnline: true,
                    lastChecked: new Date().toISOString()
                }

                serviceStatuses = [...serviceStatuses, newService]
                break

            case 'update':
                if (!body.serviceName || !body.updatedService) {
                    return NextResponse.json(
                        { error: 'Service name and updated service data are required' },
                        { status: 400 }
                    )
                }

                const serviceIndex = serviceStatuses.findIndex(s => s.name === body.serviceName)
                if (serviceIndex === -1) {
                    return NextResponse.json(
                        { error: 'Service not found' },
                        { status: 404 }
                    )
                }

                // If name is being changed, check if new name already exists
                if (body.updatedService.name && body.updatedService.name !== body.serviceName &&
                    serviceStatuses.some(s => s.name === body.updatedService.name)) {
                    return NextResponse.json(
                        { error: 'Service with this name already exists' },
                        { status: 400 }
                    )
                }

                serviceStatuses[serviceIndex] = {
                    ...serviceStatuses[serviceIndex],
                    ...body.updatedService,
                    lastChecked: new Date().toISOString()
                }
                break

            case 'delete':
                if (!body.serviceName) {
                    return NextResponse.json(
                        { error: 'Service name is required' },
                        { status: 400 }
                    )
                }

                serviceStatuses = serviceStatuses.filter(s => s.name !== body.serviceName)
                break

            case 'updatePositions':
                const { services } = body
                if (!Array.isArray(services)) {
                    return NextResponse.json(
                        { error: 'Invalid services data' },
                        { status: 400 }
                    )
                }

                // Validate and update each service position
                serviceStatuses = serviceStatuses.map(existingService => {
                    const updatedService = services.find(s => s.name === existingService.name)
                    if (updatedService && typeof updatedService.position === 'number') {
                        return {
                            ...existingService,
                            position: updatedService.position
                        }
                    }
                    return existingService
                })
                break

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        return NextResponse.json({ success: true, services: serviceStatuses })
    } catch (error) {
        console.error('Error processing service request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}