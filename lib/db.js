import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

let prisma;

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

// Use the adapter strictly in Edge runtime or Production Node with a connection string
const isEdge = process.env.NEXT_RUNTIME === 'edge';
const isProd = process.env.NODE_ENV === 'production';

if ((isEdge || isProd) && connectionString) {
    try {
        const pool = new pg.Pool({ connectionString });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    } catch (e) {
        console.error('Failed to initialize Prisma Edge Adapter:', e);
        prisma = globalForPrisma.prisma ?? new PrismaClient();
    }
} else {
    // Local development or build-time (where env vars might be missing)
    prisma = globalForPrisma.prisma ?? new PrismaClient();
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
