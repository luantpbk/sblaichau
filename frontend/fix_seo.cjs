const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Title and general references
content = content.replace(/Weltrus Official Website-New Energy Solution Provider/g, 'S&B Lai Châu - Giải pháp năng lượng lưu trữ chuyên nghiệp');
content = content.replace(/Weltrus provides innovative energy storage solutions for homes and businesses\. Advanced lithium-ion battery systems for solar integration and backup power\./g, 'S&B Lai Châu chuyên cung cấp các giải pháp năng lượng tái tạo, lưu trữ điện, pin năng lượng mặt trời chuyên nghiệp, an toàn và đáng tin cậy.');
content = content.replace(/Global Partner in Photovoltaic, Storage &amp; Safety Solutions/g, 'Đối tác toàn cầu về giải pháp quang điện, lưu trữ & an toàn');
content = content.replace(/Global Partner in Photovoltaic, Storage & Safety Solutions/g, 'Đối tác toàn cầu về giải pháp quang điện, lưu trữ & an toàn');
content = content.replace(/@weltrus_energy/g, '@sblaichau');
content = content.replace(/https:\/\/www.facebook.com\/Weltrus\//g, 'https://www.facebook.com/sblaichau/');

// Replace favicon
// Currently it is likely using Weltrus icon or default. Let's see if we can find favicon tags.
// I will just replace the href for the favicon icons.
content = content.replace(/wp-content\/uploads\/2024\/10\/cropped-favicon-32x32\.png/g, '/assets/uploads/2024/07/logo.png');
content = content.replace(/wp-content\/uploads\/2024\/10\/cropped-favicon-192x192\.png/g, '/assets/uploads/2024/07/logo.png');
content = content.replace(/wp-content\/uploads\/2024\/10\/cropped-favicon-180x180\.png/g, '/assets/uploads/2024/07/logo.png');
content = content.replace(/wp-content\/uploads\/2024\/10\/cropped-favicon-270x270\.png/g, '/assets/uploads/2024/07/logo.png');

// If there are other favicons, we can inject a new one. But let's check for standard WP favicon names.
const faviconRegex = /<link rel="icon" [^>]*>/g;
content = content.replace(faviconRegex, '<link rel="icon" href="/assets/uploads/2024/07/logo.png" sizes="32x32" />');

const appleTouchIconRegex = /<link rel="apple-touch-icon" [^>]*>/g;
content = content.replace(appleTouchIconRegex, '<link rel="apple-touch-icon" href="/assets/uploads/2024/07/logo.png" />');

const msApplicationIconRegex = /<meta name="msapplication-TileImage" [^>]*>/g;
content = content.replace(msApplicationIconRegex, '<meta name="msapplication-TileImage" content="/assets/uploads/2024/07/logo.png" />');

// Let's also check if it has a meta keywords tag, if not, inject it.
if (!content.includes('meta name="keywords"')) {
    content = content.replace(/<meta name="description"/, '<meta name="keywords" content="SBLaiChau, Điện mặt trời Lai Châu, Năng lượng tái tạo, Lưu trữ điện, Pin năng lượng mặt trời" />\n\t<meta name="description"');
}

fs.writeFileSync('index.html', content);
console.log('Fixed SEO, Title, Keywords, and Favicon!');
