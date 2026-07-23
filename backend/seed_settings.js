const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString =
  "postgresql://thanhluan:thanhluan@@127.0.0.1:5432/sblaichau";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedSettings() {
  const initialSettings = [
    { key: "footer_email", value: "support@sblaichau.vn" },
    { key: "footer_phone1", value: "0857.688.626" },
    { key: "footer_phone2", value: "0986.072.277" },
    { key: "footer_logo", value: "/assets/uploads/2024/07/logo.png" },
  ];

  for (const s of initialSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value },
    });
  }

  console.log("Settings seeded successfully!");
  await prisma.$disconnect();
}

seedSettings();
