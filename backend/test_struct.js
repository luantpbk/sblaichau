const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('kaz.html', 'utf8');
const $ = cheerio.load(html);
console.log('HTML of article.post:', $('article.post').html().substring(0, 800));
