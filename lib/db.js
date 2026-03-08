import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

let prisma;

// On Cloudflare Edge, process.env.HYPERDRIVE might be an object
// We check for the connectionString property
if (process.env.HYPERDRIVE && typeof process.env.HYPERDRIVE === 'object' && process.env.HYPERDRIVE.connectionString) {
    const pool = new pg.Pool({ connectionString: process.env.HYPERDRIVE.connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    // Standard Node.js / Local Dev approach
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export default prisma;
