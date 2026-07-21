require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cheerio = require('cheerio');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncProduct(slug, url) {
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
        if (imageUrl) {
            imageUrl = imageUrl.replace('https://www.weltrus.com/wp-content/', '/assets/');
        }
        
        let content = '';
        const contentArea = $('.elementor-location-single');
        if (contentArea.length > 0) {
            content = contentArea.html();
        } else {
            // Strip out header, footer, etc. from main
            $('header').remove();
            $('footer').remove();
            $('[data-elementor-type="header"]').remove();
            $('[data-elementor-type="footer"]').remove();
            $('[data-elementor-type="popup"]').remove();
            content = $('main').html() || '';
        }
        
        if (!content) {
            console.error(`No content found for ${slug}`);
            return;
        }
        
        // Clean up content URLs
        content = content.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
        
        // Update product in DB
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
                    isTranslated: false
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
                    isTranslated: false
                }
            });
        }
        console.log(`Successfully synced ${slug}`);
    } catch (err) {
        console.error(`Error syncing ${slug}:`, err);
    }
}

async function main() {
    await syncProduct('thermal-overload-relay', 'https://www.weltrus.com/product/thermal-overload-relay/');
    await prisma.$disconnect();
}
main();
