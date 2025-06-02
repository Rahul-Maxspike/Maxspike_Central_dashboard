'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceStatus } from '@/utils/portCheck'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// SortableItem component to be used in the list
function SortableItem({ service }: { service: ServiceStatus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: service.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg shadow border-l-4 flex items-center justify-between cursor-grab active:cursor-grabbing ${
        service.isExternal
          ? 'bg-blue-50 border-blue-500'
          : service.isOnline
          ? 'bg-green-50 border-green-500'
          : 'bg-red-50 border-red-500'
      }`}
    >
      <div className="flex items-center">
        <span className="mr-3 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </span>
        <div>
          <h3 className="font-medium">{service.name}</h3>
          <p className="text-sm text-gray-500">
            {service.isExternal
              ? 'External Service'
              : `${service.url}:${service.port}${service.path !== '/' ? service.path : ''}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  // Existing state
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServiceStatus | null>(null)
  const [newService, setNewService] = useState<Partial<ServiceStatus>>({
    name: '',
    url: '',
    port: 0,
    path: '/',
    isExternal: false,
    externalUrl: '',
    isManualStatus: true,
    isOnline: true,
    position: 0
  })
  const [viewMode, setViewMode] = useState<'edit' | 'arrange'>('edit')
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = () => {
      // Get the admin_token cookie
      const cookies = document.cookie.split(';').map(cookie => cookie.trim())
      const adminToken = cookies.find(cookie => cookie.startsWith('admin_token='))?.split('=')[1]
      
      if (adminToken !== 'admin_authenticated') {
        router.push('/admin/login')
      }
    }
    
    checkAdminAuth()
  }, [router])

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const response = await fetch('/api/auth/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsAuthenticated(true)
        setUsername('')
        setPassword('')
      } else {
        setAuthError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      setAuthError('An error occurred during authentication')
      console.error('Authentication error:', error)
    }
  }
  
  // Only fetch services if authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    
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
  }, [isAuthenticated])

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
          service: {
            ...newService,
            isExternal: newService.isExternal ?? false,
            externalUrl: newService.externalUrl ?? '',
            port: newService.port ?? 0,
            path: newService.path ?? '/'
          }
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

  const handleEditService = async (service: ServiceStatus) => {
    setEditingService(service)
    setNewService({
      ...service,
      isExternal: service.isExternal ?? false,
      externalUrl: service.externalUrl ?? '',
      port: service.port ?? 0,
      path: service.path ?? '/'
    })
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          serviceName: editingService.name,
          updatedService: {
            ...newService,
            isExternal: newService.isExternal ?? false,
            externalUrl: newService.externalUrl ?? '',
            port: newService.port ?? 0,
            path: newService.path ?? '/'
          }
        }),
      })

      if (response.ok) {
        const { services: updatedServices } = await response.json()
        setServices(updatedServices)
        setEditingService(null)
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
      console.error('Failed to update service:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingService(null)
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

  // Sort services by position for display
  const sortedServices = [...services].sort((a, b) => 
    (a.position ?? Infinity) - (b.position ?? Infinity)
  );

  // Handle drag end for reordering with dnd-kit
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    if (active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);
        
        const updatedServices = arrayMove(items, oldIndex, newIndex).map((service, index) => ({
          ...service,
          position: index
        }));

        // Save the new order to the server
        saveServicePositions(updatedServices);
        
        return updatedServices;
      });
    }
  };

  const saveServicePositions = async (updatedServices: ServiceStatus[]) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePositions',
          services: updatedServices
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update service positions');
      }
    } catch (error) {
      console.error('Error saving service positions:', error);
    }
  };

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src="/assets/logo.jpeg"
                alt="MaxSpike Logo"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {authError && (
              <div className="text-red-500 text-sm text-center">{authError}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login as Admin
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
        {/* Header section */}
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
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
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black mb-4">Manage Services</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 rounded-md focus:outline-none ${
                  viewMode === 'edit' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Edit Services
              </button>
              <button
                onClick={() => setViewMode('arrange')}
                className={`px-4 py-2 rounded-md focus:outline-none ${
                  viewMode === 'arrange' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Arrange Services
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'edit' ? (
          <>
            {/* Add/Edit service form */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-4">
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
                <div className="flex justify-end gap-2">
                  {editingService && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
            </div>
          </form>
        </div>

        {/* Service list for editing */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">Manage Services</h2>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.name)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    ) : (
      /* Arrange services section with @dnd-kit */
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4">Arrange Services</h2>
        <p className="mb-4 text-gray-600">Drag and drop services to change their order on the dashboard.</p>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortedServices.map(s => s.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedServices.map((service) => (
                <SortableItem key={service.name} service={service} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    )}
  </div>
</main>
);
}