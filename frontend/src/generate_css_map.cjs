const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../../../source/sblaichau/www.weltrus.com');
const cssMap = {};

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file === 'index.html') {
            const relPath = path.relative(sourceDir, dir);
            let slug = relPath.replace(/\\/g, '/');
            if (slug === '') slug = 'home';
            
            const html = fs.readFileSync(fullPath, 'utf8');
            
            // Extract all elementor-post css
            const cssLinks = [];
            const regex = /<link[^>]*id=['"]elementor-post-[\d]+-css['"][^>]*href=['"]([^'"]+)['"][^>]*>/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                let href = match[1];
                // Convert relative to absolute from root
                href = href.replace(/\.\.\//g, '/').replace(/^\/?wp-content/, '/assets');
                if (!href.startsWith('/')) href = '/' + href;
                cssLinks.push(href);
            }
            if (cssLinks.length > 0) {
                cssMap[slug] = cssLinks;
            }
        }
    }
}

scanDir(sourceDir);

fs.writeFileSync(path.resolve(__dirname, 'pageCssMap.json'), JSON.stringify(cssMap, null, 2));
console.log("Generated pageCssMap.json with", Object.keys(cssMap).length, "pages");
