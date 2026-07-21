const cheerio = require('cheerio');
fetch('https://www.weltrus.com/location%ef%bc%9akazakhstan-40kw-40kwh/')
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log($('div[data-elementor-type]').map((i, el) => $(el).attr('data-elementor-type')).get());
    console.log($('div[data-elementor-type="wp-post"]').find('img').map((i, el) => $(el).attr('src')).get());
  });
