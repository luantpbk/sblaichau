require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesToCreate = [
  { name: 'Bộ ngắt mạch', slug: 'bo-ngat-mach' },
  { name: 'Công tắc tơ & Điều khiển động cơ', slug: 'cong-tac-to-dieu-khien-dong-co' },
  { name: 'Thiết bị chống sét lan truyền', slug: 'thiet-bi-chong-set-lan-truyen' },
  { name: 'Công tắc tơ DC điện áp cao', slug: 'cong-tac-to-dc-dien-ap-cao' },
  { name: 'Khác', slug: 'khac' }
];

async function main() {
  console.log('Seeding categories...');
  const categoryMap = {};
  
  // Create categories if they don't exist
  for (const cat of categoriesToCreate) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await prisma.category.create({
        data: { name: cat.name, slug: cat.slug, description: `Danh mục ${cat.name}` }
      });
      categoryMap[created.slug] = created.id;
    } else {
      categoryMap[existing.slug] = existing.id;
    }
  }
  console.log('Categories created/found:', categoryMap);

  console.log('Mapping products...');
  const products = await prisma.product.findMany();
  
  let mappedCount = 0;

  for (const product of products) {
    const title = (product.name || '').toLowerCase();
    const slug = (product.slug || '').toLowerCase();
    const content = title + ' ' + slug;

    let targetCatSlug = 'khac'; // Default

    if (content.includes('ngắt mạch') || content.includes('breaker') || content.includes('mcb') || content.match(/fx[0-9]/) || content.match(/fxm/)) {
      targetCatSlug = 'bo-ngat-mach';
    } 
    if (content.includes('công tắc tơ') && !content.includes('cao') && !content.includes('dc')) {
       targetCatSlug = 'cong-tac-to-dieu-khien-dong-co';
    } else if (content.includes('contactor') || content.includes('khởi động') || content.includes('rơ') || content.includes('relay') || content.match(/fxr/)) {
      targetCatSlug = 'cong-tac-to-dieu-khien-dong-co';
    }
    if (content.includes('chống sét') || content.includes('surge') || content.includes('fxpv')) {
      targetCatSlug = 'thiet-bi-chong-set-lan-truyen';
    }
    if ((content.includes('công tắc tơ') && content.includes('dc')) || content.includes('high voltage dc contactor') || content.includes('gốm')) {
      targetCatSlug = 'cong-tac-to-dc-dien-ap-cao';
    }

    if (categoryMap[targetCatSlug]) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: categoryMap[targetCatSlug] }
      });
      mappedCount++;
    }
  }

  // Optional: map Solutions similarly if applicable
  const solutions = await prisma.solution.findMany();
  for (const sol of solutions) {
     if (sol.slug && sol.slug !== 'contact-us') {
         await prisma.solution.update({
             where: { id: sol.id },
             data: { categoryId: categoryMap['khac'] }
         });
     }
  }

  console.log(`Mapped ${mappedCount} products to categories successfully!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
