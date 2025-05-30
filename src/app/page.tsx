'use client'

import { useEffect, useState } from 'react'
import { ServiceStatus } from '@/utils/portCheck'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
            <h1 className="text-3xl font-bold text-gray-900">MaxSpike Central</h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Admin Panel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceStatuses.map((service) => {
            const href = service.isExternal
              ? service.externalUrl
              : `http://${service.url}:${service.port}`

            return (
              <div
                key={service.name}
                className={`block p-6 rounded-lg shadow-lg ${service.isExternal
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
                  <p className="mt-2 text-sm text-gray-600">
                    {service.url}:{service.port}
                  </p>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {service.isExternal ? (
                      <span className="text-blue-600">External Link</span>
                    ) : (
                      <>
                        Status:{' '}
                        <span
                          className={
                            service.isOnline ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {service.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </>
                    )}
                  </p>

                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Open →
                  </a>
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
