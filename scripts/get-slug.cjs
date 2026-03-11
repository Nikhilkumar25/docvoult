const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const link = await prisma.link.findFirst({
    where: { isActive: true, enableAI: true },
    select: { slug: true }
  });
  if (link) {
    console.log(link.slug);
  } else {
    console.log('No active AI-enabled link found');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
