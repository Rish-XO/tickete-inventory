// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.upsert({
    where: { id: 14 },
    update: {},
    create: {
      id: 14,
      name: 'Product 14',
      availableDays: ['Monday', 'Tuesday', 'Wednesday'],
    },
  });

  await prisma.product.upsert({
    where: { id: 15 },
    update: {},
    create: {
      id: 15,
      name: 'Product 15',
      availableDays: ['Sunday'],
    },
  });

  console.log('✅ Seeded products 14 and 15!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
