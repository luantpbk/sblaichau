require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FALLBACK_IMAGE = '/assets/uploads/2026/07/Green-Energy-Solutions-Renewable-Sources-4-3-1200px.jpg';

async function fixEmptyImages() {
  console.log('Fixing empty images in the database...');
  
  // 1. Fix Products
  const products = await prisma.product.updateMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    data: { imageUrl: FALLBACK_IMAGE }
  });
  console.log(`Updated ${products.count} products with fallback image.`);

  // 2. Fix Solutions
  const solutions = await prisma.solution.updateMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    data: { imageUrl: FALLBACK_IMAGE }
  });
  console.log(`Updated ${solutions.count} solutions with fallback image.`);

  // 3. Fix Cases
  const cases = await prisma.case.updateMany({
    where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
    data: { imageUrl: FALLBACK_IMAGE }
  });
  console.log(`Updated ${cases.count} cases with fallback image.`);
  
  console.log('Done!');
}

fixEmptyImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
