require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const stats = {};
    for (const model of ['page', 'category', 'product', 'news', 'blog', 'case', 'solution']) {
        stats[model] = await prisma[model].count({ where: { isTranslated: false } });
    }
    console.log(stats);
}
main().finally(() => prisma.$disconnect());
