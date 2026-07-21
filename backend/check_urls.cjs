const cheerio = require('cheerio');
async function check(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(url, 'Title:', $('title').text());
    
    // Check if it's a product, category, or case
    const isSingleProduct = $('body').hasClass('single-product') || $('body').hasClass('single-post') && url.includes('ci-ess');
    console.log('  isSingleProduct:', isSingleProduct);
    const bodyClasses = $('body').attr('class');
    console.log('  bodyClasses:', bodyClasses);
}
Promise.all([
    check('https://www.weltrus.com/fx-h-hybrid-inverter-series/'),
    check('https://www.weltrus.com/ci-ess/commercial-industrial-ess-50kw/'),
    check('https://www.weltrus.com/category/cases/vanadium-battery-energy-storage/')
]);
