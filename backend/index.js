require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Require ADMIN role' });
  }
  next();
}

// Routes
// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed an initial admin user if no users exist
app.post('/api/auth/setup', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return res.status(400).json({ error: 'Admin user already exists' });
    
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: 'ADMIN' }
    });
    res.json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../frontend/public/assets/uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the public URL for the image
  const publicUrl = `/assets/uploads/images/${req.file.filename}`;
  res.json({ url: publicUrl });
});

const { translateModelFields } = require('./translator');

// --- CRUD: Pages ---
app.get('/api/pages', async (req, res) => {
  const pages = await prisma.page.findMany();
  res.json(pages);
});
app.get('/api/pages/:slug', async (req, res) => {
  const item = await prisma.page.findUnique({ where: { slug: req.params.slug } });
  if (item) {
     if (!item.isTranslated) {
        const translated = await translateModelFields(item);
        const { id, isTranslated, ...updateData } = translated;
        await prisma.page.update({ where: { id: item.id }, data: { ...updateData, isTranslated: true } });
        return res.json({ ...translated, isTranslated: true });
     }
     res.json(item);
  } else {
     res.status(404).json({ error: 'Not found' });
  }
});

app.get('/api/elementor-css/:id', (req, res) => {
  const dir = path.join(__dirname, '../frontend/public/assets/uploads/elementor/css');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const file = files.find(f => f.startsWith(`post-${req.params.id}`) && f.endsWith('.css'));
    if (file) {
      res.json({ url: `/assets/uploads/elementor/css/${file}` });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// New generic endpoint to find content by slug across all tables
app.get('/api/content', async (req, res) => {
  let { slug } = req.query;
  const models = ['page', 'category', 'product', 'news', 'blog', 'case', 'solution'];
  
  // Clean up slug if it has prefixes like 'products/' or 'solution/'
  // Also strip trailing /index.html or .html
  let cleanSlug = slug.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  const baseSlug = cleanSlug.split('/').pop();
  
  for (const model of models) {
    // Try exact match first
    let queryArgs = { where: { slug: cleanSlug || '' } };
    if (model === 'category') {
      queryArgs.include = { products: true, solutions: true, news: true, blogs: true, cases: true };
    }
    let item = await prisma[model].findUnique(queryArgs);
    
    // If not found, try base slug
    if (!item && cleanSlug !== baseSlug) {
        let baseQueryArgs = { where: { slug: baseSlug || '' } };
        if (model === 'category') {
            baseQueryArgs.include = { products: true, solutions: true, news: true, blogs: true, cases: true };
        }
        item = await prisma[model].findUnique(baseQueryArgs);
    }

    if (item) {
      if (!item.isTranslated) {
          console.log(`[LAZY-TRANSLATE] Translating ${model} - ${slug}`);
          try {
             const translated = await translateModelFields(item);
             
             // Ensure we don't try to pass relationships or id/isTranslated directly to Prisma update if it's messy, 
             // but our object is flat. We just destructure.
             const { id, isTranslated, category, products, solutions, news, blogs, cases, ...updateData } = translated; 
             await prisma[model].update({ where: { id: item.id }, data: { ...updateData, isTranslated: true } });
             
             if (translated.content && translated.content.includes('đang được chúng tôi cập nhật thông tin chi tiết')) {
                 translated.content = '';
             }
             if (translated.products && Array.isArray(translated.products)) {
                 translated.products.forEach(p => {
                     if (p.content && p.content.includes('đang được chúng tôi cập nhật thông tin chi tiết')) {
                         p.content = '';
                     }
                 });
             }
             
             return res.json({ type: model, ...translated, isTranslated: true });
          } catch(err) {
             console.error(`[LAZY-TRANSLATE] Failed to translate ${model} - ${slug}:`, err.message);
             // Return the original untranslated item so the page loads (in English),
             // but do NOT update the DB, so it will retry next time.
             return res.json({ type: model, ...item, translationFailed: true });
          }
      } else {
          if (item.content && item.content.includes('đang được chúng tôi cập nhật thông tin chi tiết')) {
              item.content = '';
          }
          if (item.products && Array.isArray(item.products)) {
              item.products.forEach(p => {
                  if (p.content && p.content.includes('đang được chúng tôi cập nhật thông tin chi tiết')) {
                      p.content = '';
                  }
              });
          }
          return res.json({ type: model, ...item });
      }
    }
  }
  
  res.status(404).json({ error: 'Not found' });
});

// Helper to sanitize incoming data for Prisma
function cleanData(data) {
  const cleaned = { ...data };
  delete cleaned.id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  delete cleaned.category;
  delete cleaned.products;
  delete cleaned.solutions;
  delete cleaned.news;
  delete cleaned.blogs;
  delete cleaned.cases;
  if (cleaned.categoryId) cleaned.categoryId = Number(cleaned.categoryId);
  return cleaned;
}

app.post('/api/pages', authenticateToken, requireAdmin, async (req, res) => {
  const page = await prisma.page.create({ data: cleanData(req.body) });
  res.json(page);
});
app.put('/api/pages/:id', authenticateToken, requireAdmin, async (req, res) => {
  const page = await prisma.page.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(page);
});
app.delete('/api/pages/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.page.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: Categories ---
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany({ include: { products: true, solutions: true, news: true, blogs: true, cases: true } });
  res.json(categories);
});
app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  const category = await prisma.category.create({ data: cleanData(req.body) });
  res.json(category);
});
app.put('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  const category = await prisma.category.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(category);
});
app.delete('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: Products ---
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(products);
});
app.get('/api/products/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, include: { category: true } });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  const product = await prisma.product.create({ data: cleanData(req.body) });
  res.json(product);
});
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(product);
});
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: News ---
app.get('/api/news', async (req, res) => {
  const news = await prisma.news.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  res.json(news);
});
app.get('/api/news/:slug', async (req, res) => {
  const item = await prisma.news.findUnique({ where: { slug: req.params.slug }, include: { category: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});
app.post('/api/news', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.news.create({ data: cleanData(req.body) });
  res.json(item);
});
app.put('/api/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.news.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(item);
});
app.delete('/api/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.news.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: Blogs ---
app.get('/api/blogs', async (req, res) => {
  const blogs = await prisma.blog.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  res.json(blogs);
});
app.get('/api/blogs/:slug', async (req, res) => {
  const item = await prisma.blog.findUnique({ where: { slug: req.params.slug }, include: { category: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});
app.post('/api/blogs', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.blog.create({ data: cleanData(req.body) });
  res.json(item);
});
app.put('/api/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.blog.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(item);
});
app.delete('/api/blogs/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.blog.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: Cases ---
app.get('/api/cases', async (req, res) => {
  const cases = await prisma.case.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  res.json(cases);
});
app.get('/api/cases/:slug', async (req, res) => {
  const item = await prisma.case.findUnique({ where: { slug: req.params.slug }, include: { category: true } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});
app.post('/api/cases', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.case.create({ data: cleanData(req.body) });
  res.json(item);
});
app.put('/api/cases/:id', authenticateToken, requireAdmin, async (req, res) => {
  const item = await prisma.case.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(item);
});
app.delete('/api/cases/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.case.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- CRUD: Solutions ---
app.get('/api/solutions', async (req, res) => {
  const solutions = await prisma.solution.findMany({ include: { category: true } });
  res.json(solutions);
});
app.get('/api/solutions/:slug', async (req, res) => {
  const solution = await prisma.solution.findUnique({ where: { slug: req.params.slug } });
  if (!solution) return res.status(404).json({ error: 'Not found' });
  res.json(solution);
});
app.post('/api/solutions', authenticateToken, requireAdmin, async (req, res) => {
  const solution = await prisma.solution.create({ data: cleanData(req.body) });
  res.json(solution);
});
app.put('/api/solutions/:id', authenticateToken, requireAdmin, async (req, res) => {
  const solution = await prisma.solution.update({ where: { id: Number(req.params.id) }, data: cleanData(req.body) });
  res.json(solution);
});
app.delete('/api/solutions/:id', authenticateToken, requireAdmin, async (req, res) => {
  await prisma.solution.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  const settings = await prisma.setting.findMany();
  res.json(settings);
});

app.post('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  const settingsArray = req.body;
  if (!Array.isArray(settingsArray)) {
    return res.status(400).json({ error: 'Expected an array of settings' });
  }

  try {
    for (const s of settingsArray) {
      if (s.key && s.value !== undefined) {
        await prisma.setting.upsert({
          where: { key: s.key },
          update: { value: String(s.value) },
          create: { key: s.key, value: String(s.value) }
        });
      }
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Backend server đang chạy trên port ${PORT}`);
});
