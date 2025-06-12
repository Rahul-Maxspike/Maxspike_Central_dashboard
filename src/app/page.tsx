'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceStatus } from '@/utils/portCheck'
import Image from 'next/image'

export default function Home() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [useExternalUrl, setUseExternalUrl] = useState(false)
  const router = useRouter()

  // Fetch initial status
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()
        setServiceStatuses(data)
      } catch (error) {
        console.error('Failed to fetch service statuses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatuses()
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatuses, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Filter and sort services based on selected filter and position
  const filteredServices = serviceStatuses
    .slice() // Create a copy to avoid mutating the original array
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
    .filter(service => {
      if (filter === 'all') return true;
      if (filter === 'online') return service.isExternal || service.isOnline;
      if (filter === 'offline') return !service.isExternal && !service.isOnline;
      return true;
    });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/')}
            >
              <Image
                src="/assets/logo.jpeg"
                alt="MaxSpike Logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">MaxSpike Central</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Use External URLs</span>
              <button
                onClick={() => setUseExternalUrl(!useExternalUrl)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  useExternalUrl ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useExternalUrl ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                  router.push('/login')
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md focus:outline-none ${filter === 'all' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            All Services
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-4 py-2 rounded-md focus:outline-none ${filter === 'online' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            Online
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-4 py-2 rounded-md focus:outline-none ${filter === 'offline' 
              ? 'bg-red-600 text-white' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            Offline
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            // Use localUrl when available for local services and useExternalUrl is false
            const href = service.isExternal
              ? service.externalUrl
              : useExternalUrl
                ? `http://${service.url}:${service.port}${service.path || '/'}`
                : service.localUrl 
                  ? `http://${service.localUrl}:${service.port}${service.path || '/'}`
                  : `http://${service.url}:${service.port}${service.path || '/'}`;

            // Format the display URL without protocol
            const displayUrl = useExternalUrl 
              ? `${service.url}:${service.port}${service.path !== '/' ? service.path : ''}`
              : service.localUrl 
                ? `${service.localUrl}:${service.port}${service.path !== '/' ? service.path : ''}`
                : `${service.url}:${service.port}${service.path !== '/' ? service.path : ''}`;

            return (
              <div
                key={service.name}
                onClick={() => {
                  console.log('Redirecting to:', href); // Debug log
                  window.open(href, '_blank');
                }}
                className={`block p-6 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-[1.02] ${service.isExternal
                  ? 'bg-blue-50 border-blue-500'
                  : service.isOnline
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                  } border-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{service.name}</h2>
                  {!service.isExternal && (
                    <div
                      className={`w-3 h-3 rounded-full ${service.isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    />
                  )}
                </div>

                {!service.isExternal && (
                  <p className="mt-2 text-sm text-gray-700">
                    {displayUrl}
                  </p>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {service.isExternal ? (
                      <span className="text-blue-800">External Link</span>
                    ) : (
                      <>
                        <span className="text-gray-900 font-semibold">Status</span>:{' '}
                        <span
                          className={
                            service.isOnline ? 'text-green-800' : 'text-red-800'
                          }
                        >
                          {service.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </>
                    )}
                  </p>

                  <span className="text-sm text-indigo-600 hover:text-indigo-800">
                    Click to open →
                  </span>
                </div>

                {service.lastChecked && (
                  <p className="mt-2 text-xs text-gray-500">
                    Last updated: {new Date(service.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
