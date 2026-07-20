require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { translateModelFields } = require('./translator');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const models = ['page', 'category', 'product', 'news', 'blog', 'case', 'solution'];
    let totalTranslated = 0;

    for (const model of models) {
        console.log(`Checking untranslated items in ${model}...`);
        
        // Find all untranslated items
        const items = await prisma[model].findMany({
            where: { isTranslated: false }
        });
        
        console.log(`Found ${items.length} untranslated ${model}(s).`);
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(`Translating ${model} - ${item.slug || item.id} (${i+1}/${items.length})...`);
            
            try {
                const translated = await translateModelFields(item);
                
                // Exclude relation fields and generated fields before updating
                const { id, isTranslated, category, products, solutions, news, blogs, cases, createdAt, updatedAt, ...updateData } = translated;
                
                // Prisma update
                await prisma[model].update({
                    where: { id: item.id },
                    data: {
                        ...updateData,
                        isTranslated: true
                    }
                });
                
                console.log(`Successfully translated ${item.slug || item.id}`);
                totalTranslated++;
                
                // Small delay to respect rate limits
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error(`Failed to translate ${item.slug || item.id}: ${err.message}`);
                console.error('Will skip this item and continue.');
            }
        }
    }
    
    console.log(`\nBatch translation complete! Translated ${totalTranslated} items.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
