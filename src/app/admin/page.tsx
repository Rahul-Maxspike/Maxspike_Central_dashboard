'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceStatus } from '@/utils/portCheck'
import Image from 'next/image'

export default function AdminPage() {
    const [services, setServices] = useState<ServiceStatus[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newService, setNewService] = useState<Partial<ServiceStatus>>({
        name: '',
        url: '',
        port: 0,
        path: '/',
        isExternal: false,
        externalUrl: '',
        isManualStatus: true,
        isOnline: true
    })
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('/api/auth/check')
            if (!response.ok) {
                router.push('/login?redirect=/admin')
            }
        }
        checkAuth()
    }, [router])

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services')
                const data = await response.json()
                setServices(data)
            } catch (error) {
                console.error('Failed to fetch services:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchServices()
    }, [])

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add',
                    service: newService
                }),
            })

            if (response.ok) {
                const { services: updatedServices } = await response.json()
                setServices(updatedServices)
                setNewService({
                    name: '',
                    url: '',
                    port: 0,
                    path: '/',
                    isExternal: false,
                    externalUrl: '',
                    isManualStatus: true,
                    isOnline: true
                })
            }
        } catch (error) {
            console.error('Failed to add service:', error)
        }
    }

    const handleDeleteService = async (serviceName: string) => {
        if (!confirm(`Are you sure you want to delete ${serviceName}?`)) return

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    serviceName
                }),
            })

            if (response.ok) {
                const { services: updatedServices } = await response.json()
                setServices(updatedServices)
            }
        } catch (error) {
            console.error('Failed to delete service:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative">
                            <Image
                                src="/assets/logo.jpeg"
                                alt="MaxSpike Logo"
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
                    <form onSubmit={handleAddService} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-black">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black">URL</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                    value={newService.url}
                                    onChange={(e) => setNewService({ ...newService, url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black">Port (Optional)</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                    value={newService.port || ''}
                                    onChange={(e) => setNewService({ ...newService, port: e.target.value ? parseInt(e.target.value) : 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black">Path</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                    value={newService.path}
                                    onChange={(e) => setNewService({ ...newService, path: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    checked={newService.isExternal}
                                    onChange={(e) => setNewService({ ...newService, isExternal: e.target.checked })}
                                />
                                <label className="ml-2 block text-sm text-black">External Service</label>
                            </div>
                            {newService.isExternal && (
                                <div>
                                    <label className="block text-sm font-medium text-black">External URL</label>
                                    <input
                                        type="url"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
                                        value={newService.externalUrl || ''}
                                        onChange={(e) => setNewService({ ...newService, externalUrl: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Service
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Manage Services</h2>
                    <div className="space-y-4">
                        {services.map((service) => (
                            <div
                                key={service.name}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <h3 className="font-medium text-black">{service.name}</h3>
                                    <p className="text-sm text-black">
                                        {service.isExternal
                                            ? service.externalUrl
                                            : `${service.url}${service.port ? `:${service.port}` : ''}${service.path}`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteService(service.name)}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
} 