require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cheerio = require('cheerio');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixThumbnailsForModel(modelName, delegate) {
    console.log(`Checking ${modelName}...`);
    const items = await delegate.findMany();
    let updatedCount = 0;

    for (const item of items) {
        let isBadImage = !item.imageUrl || item.imageUrl === '' || (typeof item.imageUrl === 'string' && (item.imageUrl.includes('logo.png') || item.imageUrl.includes('logo.svg')));
        
        if (isBadImage) {
            let newImage = null;

            // 1. If it has a images array (like Product or Solution), try to use the first image from there
            if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                newImage = item.images[0];
            } 
            
            // 2. Otherwise parse content HTML
            if (!newImage && item.content) {
                const $ = cheerio.load(item.content);
                const firstImg = $('img').first().attr('src');
                if (firstImg) {
                    newImage = firstImg;
                }
            }

            if (newImage && newImage !== item.imageUrl) {
                // Ensure weltrus URLs are mapped to local assets if necessary
                newImage = newImage.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
                
                await delegate.update({
                    where: { id: item.id },
                    data: { imageUrl: newImage }
                });
                console.log(`Updated ${modelName} ID: ${item.id} - ${item.slug} -> ${newImage}`);
                updatedCount++;
            }
        }
    }
    console.log(`Finished ${modelName}. Updated ${updatedCount} items.\n`);
}

async function main() {
    try {
        await fixThumbnailsForModel('Product', prisma.product);
        await fixThumbnailsForModel('Solution', prisma.solution);
        await fixThumbnailsForModel('News', prisma.news);
        await fixThumbnailsForModel('Blog', prisma.blog);
        await fixThumbnailsForModel('Case', prisma.case);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
