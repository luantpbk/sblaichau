require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { translateHtml, translateText } = require('./translator');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const urlsToSync = [
    { url: 'https://www.weltrus.com/fx-h-hybrid-inverter-series/', slug: 'fx-h-hybrid-inverter-series', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/ci-ess/commercial-industrial-ess-50kw/', slug: 'ci-ess/commercial-industrial-ess-50kw', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/ci-ess/commercial-industrial-ess-105kw/', slug: 'ci-ess/commercial-industrial-ess-105kw', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/ci-ess/commercial-industrial-ess-105kw-261kwh/', slug: 'ci-ess/commercial-industrial-ess-105kw-261kwh', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/fx10ft1044lp-2-all-in-one-liquid-cooled-ess-container-weltrus/', slug: 'fx10ft1044lp-2-all-in-one-liquid-cooled-ess-container-weltrus', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/fx20ft2170lp-2-all-in-one-liquid-cooled-ess-container-weltrus/', slug: 'fx20ft2170lp-2-all-in-one-liquid-cooled-ess-container-weltrus', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/ci-ess/commercial-industrial-ess-5mwh/', slug: 'ci-ess/commercial-industrial-ess-5mwh', type: 'product', catSlug: 'ci-ess' },
    { url: 'https://www.weltrus.com/category/cases/vanadium-battery-energy-storage/', slug: 'cases/vanadium-battery-energy-storage', type: 'category', catSlug: null }
];

async function downloadFile(url, dest) {
    if (fs.existsSync(dest)) return;
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(resolve); });
            } else {
                fs.unlink(dest, () => reject(`Server responded with ${response.statusCode}: ${url}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err.message));
        });
    });
}

async function syncUrls() {
    // Ensure ci-ess category exists
    let ciEssCategory = await prisma.category.findUnique({ where: { slug: 'ci-ess' } });
    if (!ciEssCategory) {
        ciEssCategory = await prisma.category.create({
            data: {
                slug: 'ci-ess',
                name: await translateText('C&I ESS'),
                isTranslated: true
            }
        });
    }

    for (const item of urlsToSync) {
        console.log(`\nSyncing ${item.url}...`);
        try {
            const res = await fetch(item.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const $ = cheerio.load(html);

            // Scrape Elementor CSS files
            const cssLinks = [];
            $('link[rel="stylesheet"]').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.includes('/elementor/css/post-')) {
                    cssLinks.push(href);
                }
            });

            let elementorId = null;
            for (const cssUrl of cssLinks) {
                const match = cssUrl.match(/post-(\d+)\.css/);
                if (match) {
                    elementorId = match[1];
                    const localPath = path.join(__dirname, '../frontend/public/assets/uploads/elementor/css', `post-${elementorId}.css`);
                    await downloadFile(cssUrl.split('?')[0], localPath).catch(console.error);
                }
            }
            
            // Extract content
            const contentWrapper = $('div[data-elementor-type]').first();
            let rawContent = '';
            if (contentWrapper.length > 0) {
                if (!elementorId) {
                    elementorId = contentWrapper.attr('data-elementor-id');
                }
                rawContent = contentWrapper.parent().html() || contentWrapper.html();
            } else {
                rawContent = $('.site-main').html() || '';
            }

            // If we still didn't find the Elementor ID, check body classes
            if (!elementorId) {
                const bodyClasses = $('body').attr('class') || '';
                const m = bodyClasses.match(/elementor-page-(\d+)/);
                if (m) elementorId = m[1];
            }

            // Rewrite image URLs
            const $content = cheerio.load(rawContent, null, false);
            const imageDownloads = [];
            $content('img').each((i, el) => {
                const src = $content(el).attr('src');
                if (src && src.includes('weltrus.com/wp-content/uploads')) {
                    const urlPath = new URL(src).pathname;
                    const localPathname = urlPath.replace('/wp-content', '/assets');
                    $content(el).attr('src', localPathname);
                    const localDest = path.join(__dirname, '../frontend/public', localPathname);
                    imageDownloads.push(downloadFile(src, localDest).catch(e => console.log('Error downloading image', e)));
                }
            });
            await Promise.all(imageDownloads);

            // Wrap content
            let finalContentHtml = $content.html();
            if (elementorId) {
                // Remove existing elementor wrapper if it was captured to avoid double wrapping
                finalContentHtml = `<div class="elementor elementor-${elementorId} elementor-location-single full-elementor-page" data-elementor-id="${elementorId}">${finalContentHtml}</div>`;
            }

            // Translate
            console.log(`Translating content for ${item.slug}...`);
            const title = $('title').text().replace('- Weltrus Official Website-New Energy Solution Provider', '').trim();
            const translatedTitle = await translateText(title);
            const translatedContent = await translateHtml(finalContentHtml);

            // Save to DB
            if (item.type === 'product') {
                await prisma.product.upsert({
                    where: { slug: item.slug },
                    update: {
                        name: translatedTitle,
                        title: translatedTitle,
                        content: translatedContent,
                        isTranslated: true,
                        categoryId: ciEssCategory.id
                    },
                    create: {
                        slug: item.slug,
                        name: translatedTitle,
                        title: translatedTitle,
                        content: translatedContent,
                        isTranslated: true,
                        categoryId: ciEssCategory.id
                    }
                });
            } else if (item.type === 'category') {
                await prisma.category.upsert({
                    where: { slug: item.slug },
                    update: {
                        name: translatedTitle,
                        title: translatedTitle,
                        content: translatedContent,
                        isTranslated: true
                    },
                    create: {
                        slug: item.slug,
                        name: translatedTitle,
                        title: translatedTitle,
                        content: translatedContent,
                        isTranslated: true
                    }
                });
            }

            console.log(`Saved ${item.type} ${item.slug} successfully.`);
        } catch (e) {
            console.error(`Failed to sync ${item.url}:`, e);
        }
    }
}

syncUrls().catch(console.error).finally(() => prisma.$disconnect());
