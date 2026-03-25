import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const docs = await prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, fileUrl: true, createdAt: true }
    });
    console.log("Newest docs:");
    console.table(docs);

    const oldDocs = await prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: 'asc' },
        select: { id: true, title: true, fileUrl: true, createdAt: true }
    });
    console.log("Oldest docs:");
    console.table(oldDocs);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
