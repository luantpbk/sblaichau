const fs = require('fs');
const html = fs.readFileSync('micro_content.html', 'utf8');
const matches = html.match(/href=[\"'](.*?)[\"']/g);
console.log(matches ? matches.join('\n') : 'No matches');
