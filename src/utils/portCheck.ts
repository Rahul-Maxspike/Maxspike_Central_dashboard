export interface ServiceStatus {
    name: string
    url: string
    port: number
    isManualStatus: boolean
    isOnline: boolean
    isExternal?: boolean
    externalUrl?: string
    lastChecked?: string
    path?: string
    position?: number
}

export async function checkHtmlResponse(url: string, port: number, path: string = ''): Promise<boolean> {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(`http://${url}:${port}${path}`, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        })

        clearTimeout(timeoutId)

        if (!response.ok) return false

        const contentType = response.headers.get('content-type')
        const text = await response.text()

        // Check if response is HTML
        return contentType?.includes('text/html') ||
            text.toLowerCase().includes('<!doctype html') ||
            text.toLowerCase().includes('<html')
    } catch {
        return false
    }
}

export const services: ServiceStatus[] = [
    {
        name: 'Trendlines Chart',
        url: '110.172.21.62',
        port: 5007,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 0
    },
    {
        name: 'M4A1',
        url: '110.172.21.62',
        port: 5008,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 1
    },
    {
        name: 'Motilal Dashboard',
        url: '192.168.1.9',
        port: 5015,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 2
    },
    {
        name: 'VWAP Dashboard',
        url: '110.172.21.62',
        port: 5004,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 3
    },
    {
        name: 'Credentials API',
        url: '110.172.21.62',
        port: 5005,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 4
    },
    {
        name: 'MaxSpike Client Master',
        url: '110.172.21.62',
        port: 5010,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 5
    },
    {
        name: 'Prop Daily PNL',
        url: '',
        port: 0,
        isManualStatus: true,
        isOnline: true,
        isExternal: true,
        externalUrl: 'https://docs.google.com/spreadsheets/d/1WNw1NkaBuy-L0K2DJ_JzmKXGlXPY4yAP8iE8Qk3ZTiU/edit?gid=0#gid=0',
        lastChecked: new Date().toISOString(),
        position: 6
    },
    {
        name: 'Stocks NIFTY 50',
        url: '192.168.1.9',
        port: 5000,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 7
    },
    {
        name: 'All Stocks',
        url: '192.168.1.9',
        port: 5001,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 8
    },
    {
        name: 'F2F Dashboard',
        url: '192.168.1.8',
        port: 5123,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 9
    },
    {
        name: 'Range Beginx',
        url: '192.168.1.8',
        port: 9521,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/',
        position: 10
    },
    {
        name: 'OMS Docs',
        url: '110.172.21.62',
        port: 5004,
        isManualStatus: true,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        path: '/docs',
        position: 11
    }
]