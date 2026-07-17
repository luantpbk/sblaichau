const fs = require('fs');
const code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

const desktopIdx = code.indexOf('id="header-menu-1"');
const desktopMenu = code.substring(desktopIdx, desktopIdx + 1500);

console.log(desktopMenu);
