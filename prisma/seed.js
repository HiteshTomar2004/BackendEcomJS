
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
export const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Reading products.json...');
  
  const data = fs.readFileSync(path.resolve('../defaultProducts/defaultProducts.js'), 'utf-8');
  const products = JSON.parse(data);

  console.log(`Found ${products.length} products. Seeding database...`);
  for (const p of products) {
    await prisma.product.create({
      data: {
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

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });