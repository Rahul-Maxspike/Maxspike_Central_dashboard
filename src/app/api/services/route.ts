import { NextResponse } from 'next/server'
import { 
    ServiceStatus, 
    checkHtmlResponse, 
    getServices, 
    updateService,
    addService, 
    deleteService,
    updateServicePositions
} from '@/utils/portCheck'

export async function GET() {
    try {
        // Get all services from MongoDB
        const services = await getServices();
        
        // Check all non-external services
        const updatedServices = await Promise.all(
            services.map(async (service: ServiceStatus) => {
                if (service.isExternal) return service

                const isOnline = await checkHtmlResponse(service.url, service.port, service.path);
                if (service.isOnline !== isOnline) {
                    // Update service status in database if it changed
                    await updateService(service.name, { isOnline });
                }
                
                return {
                    ...service,
                    isOnline,
                    lastChecked: new Date().toISOString()
                }
            })
        );
        
        return NextResponse.json(updatedServices);
    } catch (error) {
        console.error('Error in GET services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'add': {
                if (!body.service.name || !body.service.url) {
                    return NextResponse.json(
                        { error: 'Name and URL are required' },
                        { status: 400 }
                    )
                }

                // Check if service with same name already exists
                const services = await getServices();
                if (services.some(s => s.name === body.service.name)) {
                    return NextResponse.json(
                        { error: 'Service with this name already exists' },
                        { status: 400 }
                    )
                }

                const newService: ServiceStatus = {
                    ...body.service,
                    port: body.service.port || 0,
                    isManualStatus: true,
                    isOnline: true,
                    lastChecked: new Date().toISOString()
                }

                const success = await addService(newService);
                if (!success) {
                    return NextResponse.json(
                        { error: 'Failed to add service' },
                        { status: 500 }
                    )
                }
                break;
            }

            case 'update': {
                if (!body.serviceName || !body.updatedService) {
                    return NextResponse.json(
                        { error: 'Service name and updated service data are required' },
                        { status: 400 }
                    )
                }

                // Check if service exists
                const services = await getServices();
                const serviceIndex = services.findIndex(s => s.name === body.serviceName);
                if (serviceIndex === -1) {
                    return NextResponse.json(
                        { error: 'Service not found' },
                        { status: 404 }
                    )
                }

                // If name is being changed, check if new name already exists
                if (body.updatedService.name && body.updatedService.name !== body.serviceName &&
                    services.some(s => s.name === body.updatedService.name)) {
                    return NextResponse.json(
                        { error: 'Service with this name already exists' },
                        { status: 400 }
                    )
                }

                const success = await updateService(body.serviceName, body.updatedService);
                if (!success) {
                    return NextResponse.json(
                        { error: 'Failed to update service' },
                        { status: 500 }
                    )
                }
                break;
            }

            case 'delete': {
                if (!body.serviceName) {
                    return NextResponse.json(
                        { error: 'Service name is required' },
                        { status: 400 }
                    )
                }

                const success = await deleteService(body.serviceName);
                if (!success) {
                    return NextResponse.json(
                        { error: 'Failed to delete service' },
                        { status: 500 }
                    )
                }
                break;
            }

            case 'updatePositions': {
                const { services } = body;
                if (!Array.isArray(services)) {
                    return NextResponse.json(
                        { error: 'Invalid services data' },
                        { status: 400 }
                    )
                }

                // Extract only name and position from the services array
                const positionUpdates: Pick<ServiceStatus, 'name' | 'position'>[] = services.map(s => ({
                    name: s.name,
                    position: s.position
                }));

                const success = await updateServicePositions(positionUpdates);
                if (!success) {
                    return NextResponse.json(
                        { error: 'Failed to update positions' },
                        { status: 500 }
                    )
                }
                break;
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }

        // Return updated services after any action
        const updatedServices = await getServices();
        return NextResponse.json({ success: true, services: updatedServices })
    } catch (error) {
        console.error('Error processing service request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}