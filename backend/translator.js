const translate = require('google-translate-api-x');
const cheerio = require('cheerio');

async function translateText(text) {
  if (!text || text.trim() === '') return text;
  try {
    const res = await translate(text, { to: 'vi' });
    return res.text;
  } catch (err) {
    console.error('Translation error:', err.message);
    return text;
  }
}

async function translateHtml(html) {
  if (!html || html.trim() === '') return html;

  const $ = cheerio.load(html, null, false);
  const textNodes = [];

  // Recursive function to collect text nodes
  function findTextNodes(node) {
    if (node.type === 'text') {
      const text = node.data.trim();
      if (text && text.length > 1 && !/^\s*$/.test(text)) {
        textNodes.push(node);
      }
    } else if (node.type === 'tag') {
      // Skip script and style tags completely
      if (node.name === 'script' || node.name === 'style' || node.name === 'noscript') {
        return;
      }
      if (node.children) {
        node.children.forEach(findTextNodes);
      }
    }
  }

  // Iterate over root elements since isDocument is false
  $.root().contents().each((_, el) => findTextNodes(el));
  
  if (textNodes.length === 0) return html;

  // Batch translate text in chunks of 50 to avoid rate limits
  const texts = textNodes.map(n => n.data);
  const chunkSize = 20; // smaller chunks to avoid payload limits
  let translatedTexts = [];
  
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    try {
      const res = await translate(chunk, { to: 'vi' });
      const chunkResults = Array.isArray(res) ? res.map(r => r.text) : [res.text];
      translatedTexts = translatedTexts.concat(chunkResults);
      // Wait to avoid rate limits
      if (i + chunkSize < texts.length) {
         await new Promise(r => setTimeout(r, 1000));
      }
    } catch(err) {
      console.error(`Chunk translation error at index ${i}:`, err.message);
      // If ANY chunk fails, we must throw so we don't save a partially translated DB record
      throw new Error('Translation failed for chunk: ' + err.message);
    }
  }
  
  textNodes.forEach((node, i) => {
     if (translatedTexts[i]) {
         node.data = translatedTexts[i];
     }
  });

  return $.html();
}

async function translateModelFields(item) {
  // item is the db row
  const translated = { ...item };
  
  // Fields to translate as plain text
  const plainFields = ['title', 'name', 'seoDescription', 'excerpt', 'description'];
  for (const field of plainFields) {
    if (translated[field] && typeof translated[field] === 'string') {
      // Check if it looks like HTML (sometimes description is HTML)
      if (translated[field].includes('<')) {
         translated[field] = await translateHtml(translated[field]);
      } else {
         translated[field] = await translateText(translated[field]);
      }
    }
  }

  // Content field (always HTML)
  if (translated.content) {
     translated.content = await translateHtml(translated.content);
  }

  // JSON fields translation
  if (translated.features && Array.isArray(translated.features)) {
      translated.features = await Promise.all(translated.features.map(f => translateHtml(f)));
  }
  if (translated.certifications && Array.isArray(translated.certifications)) {
      translated.certifications = await Promise.all(translated.certifications.map(c => translateText(c)));
  }
  if (translated.specifications && Array.isArray(translated.specifications)) {
      translated.specifications = await Promise.all(translated.specifications.map(async (spec) => ({
          name: await translateText(spec.name),
          value: await translateHtml(spec.value),
          details: await translateHtml(spec.details)
      })));
  }
  if (translated.powerCards && Array.isArray(translated.powerCards)) {
      translated.powerCards = await Promise.all(translated.powerCards.map(async (card) => ({
          title: await translateText(card.title),
          description: await translateHtml(card.description)
      })));
  }
  if (translated.sidePanels && Array.isArray(translated.sidePanels)) {
      translated.sidePanels = await Promise.all(translated.sidePanels.map(async (panel) => ({
          title: await translateText(panel.title),
          items: await Promise.all((panel.items || []).map(i => translateHtml(i)))
      })));
  }

  return translated;
}

module.exports = {
  translateText,
  translateHtml,
  translateModelFields
};
