require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cheerio = require('cheerio');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const slugs = [
    "fx-tb400",
    "500w-micro-inverter",
    "600w-micro-inverter-2",
    "800w-micro-inverter-2",
    "1000w-micro-inverter",
    "1600w-micro-inverter-2",
    "1800w-micro-inverter",
    "2000w-micro-inverter-2",
    "2400w-micro-inverter",
    "300w-micro-inverter",
    "350w-micro-inverter",
    "400w-micro-inverter",
    "600w-micro-inverter",
    "700w-micro-inverter",
    "1200w-micro-inverter",
    "1400w-micro-inverter",
    "1600w-micro-inverter",
    "2000w-micro-inverter"
];

async function syncProduct(slug, categoryId) {
    console.log(`Fetching https://www.weltrus.com/product/${slug}/ ...`);
    try {
        const response = await fetch(`https://www.weltrus.com/product/${slug}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch ${slug}: HTTP ${response.status}`);
            return;
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let title = $('h1').first().text().trim();
        if (!title) {
            title = $('meta[property="og:title"]').attr('content') || slug;
        }
        
        let imageUrl = $('meta[property="og:image"]').attr('content') || '';
        if (imageUrl) {
            imageUrl = imageUrl.replace('https://www.weltrus.com/wp-content/', '/assets/');
        }
        
        let content = '';
        const contentArea = $('.elementor-location-single');
        if (contentArea.length > 0) {
            content = contentArea.html();
        } else {
            content = $('main').html() || '';
        }
        
        if (!content) {
            console.error(`No content found for ${slug}`);
            return;
        }
        
        // Clean up content URLs
        content = content.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
        
        // Check if product exists in DB
        const existing = await prisma.product.findUnique({
            where: { slug }
        });
        
        if (existing) {
            console.log(`Product ${slug} already exists, updating...`);
            await prisma.product.update({
                where: { slug },
                data: {
                    name: title,
                    imageUrl,
                    content,
                    categoryId
                }
            });
        } else {
            console.log(`Creating product ${slug}...`);
            await prisma.product.create({
                data: {
                    slug,
                    name: title,
                    imageUrl,
                    content,
                    isTranslated: false,
                    categoryId
                }
            });
        }
        console.log(`Successfully synced ${slug}`);
    } catch (err) {
        console.error(`Error syncing ${slug}:`, err.message);
    }
}

async function main() {
    let category = await prisma.category.findUnique({
        where: { slug: 'micro-inverter' }
    });
    
    if (!category) {
        console.error("Category 'micro-inverter' not found! Creating it...");
        category = await prisma.category.create({
            data: {
                slug: 'micro-inverter',
                name: 'Micro Inverter'
            }
        });
    }
    
    for (const slug of slugs) {
        await syncProduct(slug, category.id);
        // Delay to avoid overwhelming the target server
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("All missing products synced!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
