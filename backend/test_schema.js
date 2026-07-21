const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('kaz.html', 'utf8');
const $ = cheerio.load(html);
let imageUrl = null;
$('script[type="application/ld+json"]').each((i, el) => {
    try {
        const data = JSON.parse($(el).html());
        if (data['@graph']) {
            const webpage = data['@graph'].find(item => item['@type'] === 'WebPage');
            if (webpage && webpage.image && webpage.image.url) {
                imageUrl = webpage.image.url;
            } else {
                const article = data['@graph'].find(item => item['@type'] === 'BlogPosting');
                if (article && article.image && article.image.url) {
                    imageUrl = article.image.url;
                }
            }
        }
    } catch(e) {}
});
console.log('Image URL:', imageUrl);
