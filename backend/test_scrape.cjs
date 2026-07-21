const cheerio = require('cheerio');
async function check(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    $('article h2.entry-title a').each((i, el) => console.log($(el).attr('href')));
}
check('https://www.weltrus.com/category/cases/vanadium-battery-energy-storage/');
