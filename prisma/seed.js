
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
export const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Reading products.json');
  
  const data = fs.readFileSync(path.resolve('./default-Data/defaultProducts.js'), 'utf-8');
  const products = JSON.parse(data);

  console.log(`Found ${products.length} products.`);
  for (const p of products) {
    await prisma.product.upsert({
      where:{ id: p.id },
      update:{},
      create: {
        id: p.id, 
        image: p.image,
        name: p.name,
        ratingStars: p.rating.stars,
        ratingCount: p.rating.count,
        priceCents: p.priceCents,
        keywords: {
          connectOrCreate: p.keywords.map(word => ({
            where: { word: word },
            create: { word: word }
          }))
        }
      }
    });
  }

  console.log('seeding finished successfully');
  console.log('seeding delivery options');

  const deliveryOptionsData = fs.readFileSync(path.resolve('./backend-data/deliveryOptions.json'), 'utf-8');
  const deliveryOptions = JSON.parse(deliveryOptionsData);
  console.log(deliveryOptions);

  for(const option of deliveryOptions){
    await prisma.deliveryOption.upsert({// deliveryOption from prisma.schema
      where: { id: option.id },
      update: {},
      create: {
        id: option.id,
        deliveryDays: option.deliveryDays,
        priceCents: option.priceCents
      }
    });
  } 
  console.log('delivery options seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  