const fs = require('fs');
let c = fs.readFileSync('frontend/index.html', 'utf8');
let scripts = c.match(/<script.*?src=["'](.*?)["'].*?><\/script>/g);
if (scripts) {
  scripts.forEach(s => {
    let match = s.match(/src=["'](.*?)["']/);
    if (match) console.log(match[1]);
  });
}
