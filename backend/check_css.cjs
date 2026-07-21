const cheerio = require('cheerio');
fetch('https://www.weltrus.com/product/500w-micro-inverter/').then(r=>r.text()).then(html=>{
    const $ = cheerio.load(html);
    $('link[rel="stylesheet"]').each((i,el)=>console.log($(el).attr('href')));
});
