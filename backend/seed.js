require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const connectionString = process.env.DATABASE_URL.split('?')[0];
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rootDir = path.resolve(__dirname, '..');
const skipDirs = ['backend', 'admin', 'frontend', 'wp-content', 'wp-includes', 'wp-json', 'node_modules', '.git'];

function isExcluded(dirPath) {
  const parts = dirPath.split(path.sep);
  return parts.some(part => skipDirs.includes(part));
}

function walkSync(currentDirPath, callback) {
  if (isExcluded(currentDirPath)) return;
  
  fs.readdirSync(currentDirPath).forEach((name) => {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (name === 'index.html' || filePath.endsWith('.html')) {
        callback(filePath);
      }
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

async function extractData(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);

  // Fallbacks
  const title = $('title').text().trim() || $('h1').first().text().trim() || path.basename(path.dirname(filePath));
  let description = $('meta[name="description"]').attr('content') || '';
  let imageUrl = $('meta[property="og:image"]').attr('content') || '';
  
  // Try to parse aioseo-schema
  let publishedAt = null;
  const scriptTag = $('script.aioseo-schema').html();
  if (scriptTag) {
    try {
      const schemaData = JSON.parse(scriptTag);
      const graph = schemaData['@graph'] || [];
      const webpage = graph.find(item => item['@type'] === 'WebPage');
      if (webpage && webpage.datePublished) {
        publishedAt = new Date(webpage.datePublished);
      }
      if (!description && webpage && webpage.description) description = webpage.description;
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Extract main content - simplistic approach
  let content = '';
  // Try to find the main element or a common wrapper in WordPress/Elementor
  if ($('main').length) {
    content = $('main').html();
  } else if ($('.elementor-section-wrap').length) {
    content = $('.elementor-section-wrap').html();
  } else if ($('#content').length) {
    content = $('#content').html();
  } else {
    // Fallback to body
    content = $('body').html() || '';
  }

  // Determine slug from path
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  let slug = path.dirname(relativePath);
  
  // Clean up slug if it's in root
  if (slug === '.') {
    const basename = path.basename(filePath, '.html');
    slug = basename === 'index' ? 'home' : basename;
  }
  
  // Determine Type based on path/slug rules
  let type = 'PAGE';
  if (slug.includes('category/')) type = 'CATEGORY';
  else if (slug.includes('product/') || title.toLowerCase().includes('module') || title.toLowerCase().includes('panel') || title.toLowerCase().includes('inverter')) type = 'PRODUCT';
  else if (slug.includes('blog/') || slug.includes('news/')) type = 'POST';
  else if (slug.includes('solution') || slug.includes('ci-ess') || title.toLowerCase().includes('solution')) type = 'SOLUTION';
  else if (slug === 'home' || slug === 'about-us' || slug === 'contact-us') type = 'PAGE';

  return {
    slug,
    title,
    description,
    imageUrl,
    content,
    publishedAt,
    type
  };
}

async function main() {
  console.log('Bắt đầu kết nối database...');
  await prisma.$connect();
  console.log('Bắt đầu phân tích HTML...');
  const files = [];
  walkSync(rootDir, (filePath) => {
    // filter out garbage html files like index01f7.html
    const basename = path.basename(filePath);
    if (basename !== 'index.html' && basename.length > 10 && basename.match(/index[a-z0-9]{4}\.html/)) return;
    
    files.push(filePath);
  });

  console.log(`Đã tìm thấy ${files.length} files HTML.`);

  let counts = { page: 0, category: 0, product: 0, post: 0, solution: 0 };
  let processed = 0;

  for (const filePath of files) {
    try {
      const data = await extractData(filePath);
      if (data.slug === 'home' && data.title === '') continue; // skip empty home

      // Very simple routing based on type
      if (data.type === 'CATEGORY') {
        const exists = await prisma.category.findUnique({ where: { slug: data.slug } });
        if (!exists) {
          await prisma.category.create({ data: { slug: data.slug, name: data.title, description: data.description } });
          counts.category++;
        }
      } else if (data.type === 'PRODUCT') {
        const exists = await prisma.product.findUnique({ where: { slug: data.slug } });
        if (!exists) {
          await prisma.product.create({ data: { slug: data.slug, name: data.title, description: data.description, content: data.content, imageUrl: data.imageUrl } });
          counts.product++;
        }
      } else if (data.type === 'POST') {
        const exists = await prisma.post.findUnique({ where: { slug: data.slug } });
        if (!exists) {
          await prisma.post.create({ data: { slug: data.slug, title: data.title, excerpt: data.description, content: data.content, imageUrl: data.imageUrl, publishedAt: data.publishedAt } });
          counts.post++;
        }
      } else if (data.type === 'SOLUTION') {
        const exists = await prisma.solution.findUnique({ where: { slug: data.slug } });
        if (!exists) {
          await prisma.solution.create({ data: { slug: data.slug, title: data.title, description: data.description, content: data.content, imageUrl: data.imageUrl } });
          counts.solution++;
        }
      } else { // PAGE
        const exists = await prisma.page.findUnique({ where: { slug: data.slug } });
        if (!exists) {
          await prisma.page.create({ data: { slug: data.slug, title: data.title, seoDescription: data.description, content: data.content } });
          counts.page++;
        }
      }
      processed++;
      if (processed % 100 === 0) {
        console.log(`Tiến độ: Đã xử lý ${processed}/${files.length} files...`);
      }
    } catch (err) {
      console.error(`Lỗi khi xử lý file ${filePath}: ${err.message}`);
    }
  }

  console.log('Quá trình tổng hợp hoàn tất!');
  console.log(`Kết quả: Page (${counts.page}), Category (${counts.category}), Product (${counts.product}), Post (${counts.post}), Solution (${counts.solution})`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
