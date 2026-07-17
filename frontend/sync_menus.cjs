const fs = require('fs');

const code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

// Find desktop menu
const desktopNavStart = code.indexOf('<nav\n\tid="header-menu-1"');
const desktopUlStart = code.indexOf('<ul id="menu-header-menu-xy"', desktopNavStart);
let desktopUlEnd = desktopUlStart;
let depth = 0;
for (let i = desktopUlStart; i < code.length; i++) {
    if (code.startsWith('<ul', i)) depth++;
    if (code.startsWith('</ul', i)) {
        depth--;
        if (depth === 0) {
            desktopUlEnd = i + 5;
            break;
        }
    }
}

const desktopMenuHtml = code.substring(desktopUlStart, desktopUlEnd);

// Convert desktop menu to mobile menu format
let mobileMenuHtml = desktopMenuHtml
    .replace(/id="menu-header-menu-xy"/g, '')
    .replace(/ct-toggle-dropdown-desktop-ghost/g, 'ct-toggle-dropdown-mobile')
    .replace(/<span class="ct-toggle-dropdown-desktop">[\s\S]*?<\/span>/g, '')
    .replace(/<button class="ct-toggle-dropdown-mobile".*?><\/button>/g, '<button class="ct-toggle-dropdown-mobile" aria-label="Expand dropdown menu" aria-haspopup="true" aria-expanded="false" role="menuitem"><svg class="ct-icon toggle-icon-1" width="15" height="15" viewBox="0 0 15 15"><path d="M3.9,5.1l3.6,3.6l3.6-3.6l1.4,0.7l-5,5l-5-5L3.9,5.1z"></path></svg></button>');

// Find mobile menu
const mobileNavStart = code.indexOf('class="mobile-menu has-submenu"');
const mobileUlStart = code.indexOf('<ul>', mobileNavStart);
let mobileUlEnd = mobileUlStart;
depth = 0;
for (let i = mobileUlStart; i < code.length; i++) {
    if (code.startsWith('<ul', i)) depth++;
    if (code.startsWith('</ul', i)) {
        depth--;
        if (depth === 0) {
            mobileUlEnd = i + 5;
            break;
        }
    }
}

// Replace mobile menu content
const newCode = code.substring(0, mobileUlStart) + mobileMenuHtml + code.substring(mobileUlEnd);

fs.writeFileSync('frontend/src/Layout.jsx', newCode);
console.log('Mobile menu synchronized with desktop menu!');
