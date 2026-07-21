require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
    const connectionString = process.env.DATABASE_URL.split('?')[0];
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const cat = await prisma.category.findUnique({where: {slug: 'cases/vanadium-battery-energy-storage'}, include: {cases: true}});
        console.log("Category:", cat);
        
        const cases = await prisma.case.findMany();
        console.log("All Cases:", cases.map(c => c.slug));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
