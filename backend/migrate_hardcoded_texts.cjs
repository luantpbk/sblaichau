require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const applyReplacements = (content) => {
  if (!content) return content;
  if (typeof content !== 'string') return content;
  
  let newContent = content;
  const email = "info@sblaichau.vn";
  const phone = "0857.688.626";

  // Replace old media paths
  newContent = newContent.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, "/assets/");
  newContent = newContent.replace(/\/wp-content\//gi, "/assets/"); // catch relative wp-content

  // Replace emails
  newContent = newContent.replace(/[a-zA-Z0-9._%+-]+@weltrus\.com/gi, email);
  newContent = newContent.replace(/support@sblaichau\.vn/gi, email);

  // Replace phone numbers
  newContent = newContent.replace(/\+86\s*181\s*5738\s*8806|0573-86221160/gi, phone);
  newContent = newContent.replace(/\+?86[- ]*137[- ]*3550[- ]*2672/gi, phone);
  newContent = newContent.replace(/\+86-?13735502672/gi, phone);
  newContent = newContent.replace(/400\s*900\s*8856/gi, phone);
  newContent = newContent.replace(/400-096-8566/gi, phone);
  newContent = newContent.replace(/4000968566/gi, phone);
  newContent = newContent.replace(/0986\.072\.277/gi, phone);
  newContent = newContent.replace(/0986072277/gi, phone);

  // Replace WhatsApp with Zalo
  newContent = newContent.replace(/Điện thoại\/WhatsApp/gi, "Điện thoại/Zalo");
  newContent = newContent.replace(/WhatsApp/gi, "Zalo");
  newContent = newContent.replace(/wa\.me\/\+?\d+/gi, "zalo.me/0857688626");
  newContent = newContent.replace(/api\.whatsapp\.com\/send\?phone=\+?\d+/gi, "zalo.me/0857688626");

  // Domain replacements
  newContent = newContent.replace(/weltrus\.com/gi, "sblaichau.vn");

  return newContent;
};

const processJsonField = (jsonField) => {
  if (!jsonField) return jsonField;
  
  if (Array.isArray(jsonField)) {
    return jsonField.map(item => processJsonField(item));
  } else if (typeof jsonField === 'object') {
    const newObj = {};
    for (const key in jsonField) {
      newObj[key] = processJsonField(jsonField[key]);
    }
    return newObj;
  } else if (typeof jsonField === 'string') {
    return applyReplacements(jsonField);
  }
  return jsonField;
};

async function processModel(modelName, fields, jsonFields = []) {
  console.log(`Processing model: ${modelName}...`);
  const records = await prisma[modelName].findMany();
  let updatedCount = 0;

  for (const record of records) {
    const updateData = {};
    let hasChanges = false;

    // Process string fields
    for (const field of fields) {
      if (record[field]) {
        const newValue = applyReplacements(record[field]);
        if (newValue !== record[field]) {
          updateData[field] = newValue;
          hasChanges = true;
        }
      }
    }

    // Process JSON fields
    for (const field of jsonFields) {
      if (record[field]) {
        const oldValueStr = JSON.stringify(record[field]);
        const newValue = processJsonField(record[field]);
        const newValueStr = JSON.stringify(newValue);
        if (newValueStr !== oldValueStr) {
          updateData[field] = newValue;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await prisma[modelName].update({
        where: { id: record.id },
        data: updateData
      });
      updatedCount++;
    }
  }
  console.log(`  Updated ${updatedCount} records in ${modelName}.`);
}

async function main() {
  try {
    await processModel('page', ['content', 'seoDescription', 'title']);
    await processModel('category', ['content', 'description', 'name', 'imageUrl']);
    await processModel('product', ['content', 'description', 'name', 'imageUrl'], ['images', 'features', 'specifications', 'certifications', 'powerCards', 'sidePanels']);
    await processModel('solution', ['content', 'description', 'title', 'imageUrl'], ['images', 'features', 'specifications', 'certifications', 'powerCards', 'sidePanels']);
    await processModel('news', ['content', 'excerpt', 'title', 'imageUrl']);
    await processModel('blog', ['content', 'excerpt', 'title', 'imageUrl']);
    await processModel('case', ['content', 'excerpt', 'title', 'imageUrl']);
    
    // Process settings
    await processModel('setting', ['value']);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
