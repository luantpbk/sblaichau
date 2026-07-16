require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const itemsToSeed = [
  // Products
  { slug: 'micro-inverter', name: 'Micro Inverter', type: 'product' },
  { slug: 'thermal-overload-relay', name: 'Thermal Overload Relay', type: 'product' },
  { slug: 'weltrus-ceramic-series-dc-contactors', name: 'AC Contactors', type: 'product' },
  { slug: 'high-voltage-dc-contactor', name: 'High-Voltage DC Contactor', type: 'product' },
  { slug: 'hydraulic-magnetic-circuit-breaker', name: 'Hydraulic Magnetic Circuit-breaker', type: 'product' },
  { slug: 'grpu-new-solar-panel-frame', name: 'GRPU Solar Panel Frame', type: 'product' },
  { slug: '680-700w-topcon-half-cut-bifacial-double-glass-module', name: '680-700W Solar Panels', type: 'product' },
  { slug: 'half-cut-bifacial-double-glass-module-650-670w', name: '650-670W Solar Panels', type: 'product' },
  { slug: 'half-cut-solar-module-585-610w', name: '585-610W Solar Panels', type: 'product' },
  { slug: '560-580w-mono-12bb-half-cut-solar-module', name: '560-580W Solar Panels', type: 'product' },
  { slug: '535-555w-mono-10bb-half-cut-solar-module', name: '535-555W Solar Panels', type: 'product' },
  { slug: '485-505w-topcon-half-cut-solar-module', name: '485-505W Solar Panels', type: 'product' },
  { slug: 'fx-h-hybrid-inverter-series', name: 'Residential storage and accessories', type: 'product' },
  { slug: 'commercial-industrial-ess-50kw', name: '50kW/100kWh CI ESS100', type: 'product' },
  { slug: 'commercial-industrial-ess-105kw', name: '105kW/241kWh CI ESS 241', type: 'product' },
  { slug: 'commercial-industrial-ess-105kw-261kwh', name: '105kW/261kWh ESS 261', type: 'product' },
  { slug: 'fx10ft1044lp-2-all-in-one-liquid-cooled-ess-container-weltrus', name: 'All-in-one 10FT ESS Container', type: 'product' },
  { slug: 'fx20ft2170lp-2-all-in-one-liquid-cooled-ess-container-weltrus', name: 'All-in-one 20FT ESS Container', type: 'product' },
  { slug: 'commercial-industrial-ess-5mwh', name: '5MWh CI ESS 5M', type: 'product' },

  // Solutions
  { slug: 'energy-storage-solution', title: 'Energy storage solution', type: 'solution' },
  { slug: 'floating-solar-solutions', title: 'Floating Solar Solutions', type: 'solution' },
  { slug: 'epc-one-stop-solution', title: 'EPC ONE-STOP SOLUTION', type: 'solution' },
  { slug: 'energy-storage-case-studies', title: 'Energy Storage Case Studies', type: 'case' }
];

async function seedMissing() {
  console.log('Seeding missing menu items to database...');
  for (const item of itemsToSeed) {
    if (item.type === 'product') {
      const existing = await prisma.product.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        await prisma.product.create({
          data: {
            slug: item.slug,
            name: item.name,
            description: "Nội dung chi tiết cho " + item.name + " đang được cập nhật.",
            content: "<div class='elementor-section-wrap'><div class='elementor-container'><h2>" + item.name + "</h2><p>Sản phẩm này đang được chúng tôi cập nhật thông tin chi tiết.</p></div></div>",
            isTranslated: true
          }
        });
        console.log("Created product: " + item.slug);
      } else {
        console.log("Product already exists: " + item.slug);
      }
    } else if (item.type === 'solution') {
      const existing = await prisma.solution.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        await prisma.solution.create({
          data: {
            slug: item.slug,
            title: item.title,
            description: "Nội dung chi tiết cho " + item.title + " đang được cập nhật.",
            content: "<div class='elementor-section-wrap'><div class='elementor-container'><h2>" + item.title + "</h2><p>Giải pháp này đang được chúng tôi cập nhật thông tin chi tiết.</p></div></div>",
            isTranslated: true
          }
        });
        console.log("Created solution: " + item.slug);
      } else {
        console.log("Solution already exists: " + item.slug);
      }
    } else if (item.type === 'case') {
      const existing = await prisma.case.findUnique({ where: { slug: item.slug } });
      if (!existing) {
        await prisma.case.create({
          data: {
            slug: item.slug,
            title: item.title,
            excerpt: "Nội dung chi tiết cho " + item.title + " đang được cập nhật.",
            content: "<div class='elementor-section-wrap'><div class='elementor-container'><h2>" + item.title + "</h2><p>Case study này đang được chúng tôi cập nhật thông tin chi tiết.</p></div></div>",
            isTranslated: true
          }
        });
        console.log("Created case: " + item.slug);
      } else {
        console.log("Case already exists: " + item.slug);
      }
    }
  }
  console.log('Finished seeding missing items!');
}

seedMissing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
