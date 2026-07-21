require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cheerio = require('cheerio');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const itemsToSync = [
    { url: 'https://www.weltrus.com/category/technology/', slug: 'category/technology', model: 'page' },
    { url: 'https://www.weltrus.com/august-2024-brazil-pv-exhibition/', slug: 'august-2024-brazil-pv-exhibition', model: 'news' },
    { url: 'https://www.weltrus.com/welfull-2024-mid-year-work/', slug: 'welfull-2024-mid-year-work', model: 'news' },
    { url: 'https://www.weltrus.com/about-weltrus/', slug: 'about-weltrus', model: 'page' },
    { url: 'https://www.weltrus.com/about-welfull/', slug: 'about-welfull', model: 'page' }
];

async function syncItem(item) {
    const { url, slug, model } = item;
    console.log(`Fetching ${url} ...`);
    try {
        const response = await fetch(url, {
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
        
        // Strip out header, footer, etc. from main first so we don't grab logo from header
        $('header').remove();
        $('footer').remove();
        $('[data-elementor-type="header"]').remove();
        $('[data-elementor-type="footer"]').remove();
        $('[data-elementor-type="popup"]').remove();
        
        // If og:image is the generic logo, try to find a real image in the content
        if (!imageUrl || imageUrl.includes('logo.png') || imageUrl.includes('logo.svg')) {
            const firstImg = $('main img').first().attr('src');
            if (firstImg) {
                imageUrl = firstImg;
            }
        }
        
        if (imageUrl) {
            imageUrl = imageUrl.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
        }
        
        let content = $('main').html() || '';
        
        if (!content) {
            console.error(`No content found for ${slug}`);
            return;
        }
        
        // Clean up content URLs
        content = content.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
        
        // Update item in DB
        const existing = await prisma[model].findUnique({
            where: { slug }
        });
        
        let data = {
            title,
            content,
            isTranslated: false
        };
        
        if (model === 'news' || model === 'blog' || model === 'case') {
            data.imageUrl = imageUrl;
            data.excerpt = $('meta[property="og:description"]').attr('content') || '';
        } else if (model === 'page') {
            data.seoDescription = $('meta[property="og:description"]').attr('content') || '';
        } else if (model === 'solution' || model === 'product') {
            data.imageUrl = imageUrl;
            data.description = $('meta[property="og:description"]').attr('content') || '';
        }

        if (existing) {
            console.log(`[${model}] ${slug} already exists, updating...`);
            await prisma[model].update({
                where: { slug },
                data
            });
        } else {
            console.log(`Creating [${model}] ${slug}...`);
            await prisma[model].create({
                data: {
                    slug,
                    ...data
                }
            });
        }
        console.log(`Successfully synced ${slug}`);
    } catch (err) {
        console.error(`Error syncing ${slug}:`, err);
    }
}

async function main() {
    for (const item of itemsToSync) {
        await syncItem(item);
    }
    await prisma.$disconnect();
}
main();
