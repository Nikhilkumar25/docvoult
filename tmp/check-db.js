const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Diagnostics ---');
    try {
        console.log('Testing connection...');
        await prisma.$connect();
        console.log('✅ Connection successful');

        console.log('Checking tables...');
        const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log('Tables found:', tables.map(t => t.tablename).join(', '));

        const expectedTables = ['User', 'Folder', 'Document', 'Link', 'View', 'PageView', 'Comment'];
        const missing = expectedTables.filter(t => !tables.some(row => row.tablename.toLowerCase() === t.toLowerCase()));

        if (missing.length > 0) {
            console.log('❌ Missing tables:', missing.join(', '));
        } else {
            console.log('✅ All expected tables found');
        }

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
