const https = require('https');
https.get('https://www.sblaichau.vn', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const jsMatch = data.match(/<script type="module" crossorigin src="(\/assets\/index-[^\.]+\.js)"><\/script>/);
        if (jsMatch) {
            console.log('Found JS:', jsMatch[1]);
            https.get('https://www.sblaichau.vn' + jsMatch[1], (res2) => {
                let jsData = '';
                res2.on('data', chunk => jsData += chunk);
                res2.on('end', () => {
                    console.log('Includes /categories/:', jsData.includes('/categories/'));
                    console.log('Includes /content?slug=:', jsData.includes('/content?slug='));
                });
            });
        } else {
            console.log('JS not found');
        }
    });
});
