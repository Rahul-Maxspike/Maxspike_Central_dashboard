import { MongoClient, Collection, Db } from 'mongodb';

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
    localUrl?: string  // Changed from localPath to localUrl
    isDeprecated?: boolean  // Added deprecation flag
}

// Admin authentication interface
export interface AdminAuth {
    username: string;
    password: string;
}

// MongoDB connection string - use environment variables with fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://110.172.21.62:2717';
const DB_NAME = process.env.MONGO_DB_NAME || 'Central_Dashboard';
const COLLECTION_NAME = process.env.MONGO_COLLECTION_NAME || 'Paths';

// Admin credentials - these must be entered for every admin page access
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1212';

// MongoDB client cache
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Connect to MongoDB and return the client and database
async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
    if (cachedClient && cachedDb) {
        try {
            // Test the connection
            await cachedDb.command({ ping: 1 });
            return { client: cachedClient, db: cachedDb };
        } catch (error) {
            console.error('Cached connection failed, creating new connection:', error);
            cachedClient = null;
            cachedDb = null;
        }
    }

    try {
        const client = await MongoClient.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });
        const db = client.db(DB_NAME);
        
        // Test the connection
        await db.command({ ping: 1 });
        
        cachedClient = client;
        cachedDb = db;
        
        return { client, db };
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
}

// Get the services collection
async function getCollection(): Promise<Collection<ServiceStatus>> {
    try {
        const { db } = await connectToDatabase();
        return db.collection<ServiceStatus>(COLLECTION_NAME);
    } catch (error) {
        console.error('Error getting collection:', error);
        throw new Error(`Failed to get collection: ${error.message}`);
    }
}

// Fetch all services from MongoDB
export async function getServices(): Promise<ServiceStatus[]> {
    try {
        const collection = await getCollection();
        const services = await collection.find({}).sort({ position: 1 }).toArray();
        
        if (services.length === 0) {
            console.warn('No services found in MongoDB database.');
            return [];
        }
        
        return services;
    } catch (error) {
        console.error('Error fetching services from MongoDB:', error);
        return [];
    }
}

// Update a service in MongoDB
export async function updateService(serviceName: string, updatedService: Partial<ServiceStatus>): Promise<boolean> {
    try {
        const collection = await getCollection();
        
        // Remove _id from updatedService if it exists to prevent MongoDB error
        const { _id, ...serviceWithoutId } = updatedService as any;
        
        const finalService = { 
            ...serviceWithoutId,
            lastChecked: new Date().toISOString() 
        };
        
        const result = await collection.updateOne(
            { name: serviceName }, 
            { $set: finalService }
        );
        
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating service in MongoDB:', error);
        return false;
    }
}

// Add a new service to MongoDB
export async function addService(service: ServiceStatus): Promise<boolean> {
    try {
        const collection = await getCollection();
        
        // Make sure it has a lastChecked date
        if (!service.lastChecked) {
            service.lastChecked = new Date().toISOString();
        }
        
        // Convert localPath to localUrl if it exists
        const { localPath, ...serviceData } = service as any;
        const finalService = {
            ...serviceData,
            ...(localPath && { localUrl: localPath }) // Add localUrl instead of localPath
        };
        
        const result = await collection.insertOne(finalService);
        return !!result.insertedId;
    } catch (error) {
        console.error('Error adding service to MongoDB:', error);
        return false;
    }
}

// Delete a service from MongoDB
export async function deleteService(serviceName: string): Promise<boolean> {
    try {
        const collection = await getCollection();
        const result = await collection.deleteOne({ name: serviceName });
        
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error deleting service from MongoDB:', error);
        return false;
    }
}

// Update service positions in MongoDB
export async function updateServicePositions(services: Pick<ServiceStatus, 'name' | 'position'>[]): Promise<boolean> {
    try {
        const collection = await getCollection();
        
        // Use a bulk write to update positions efficiently
        const bulkOperations = services.map(service => ({
            updateOne: {
                filter: { name: service.name },
                update: { $set: { position: service.position } }
            }
        }));
        
        const result = await collection.bulkWrite(bulkOperations);
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error updating service positions in MongoDB:', error);
        return false;
    }
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

// Check database connection and services
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const collection = await getCollection();
        const count = await collection.countDocuments();
        return count > 0;
    } catch (error) {
        console.error('Error checking MongoDB connection:', error);
        return false;
    }
}

// Verify admin credentials
export function verifyAdminCredentials(credentials: AdminAuth): boolean {
    return credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD;
}

// Check if admin is authenticated
export function isAdminAuthenticated(adminToken?: string): boolean {
    return adminToken === 'admin_authenticated';
}

// Generate admin auth token
export function generateAdminToken(): string {
    return 'admin_authenticated';
}