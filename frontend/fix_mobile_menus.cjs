const fs = require('fs');

// 1. FIX Layout.jsx (remove class="menu" from the mobile menu <ul>)
let layoutCode = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

const mobileNavStart = layoutCode.indexOf('class="mobile-menu has-submenu"');
if (mobileNavStart !== -1) {
    const mobileUlStart = layoutCode.indexOf('<ul ', mobileNavStart);
    if (mobileUlStart !== -1) {
        // We injected <ul class="menu" role="menubar">, let's just make it <ul>
        layoutCode = layoutCode.replace(/<ul class="menu" role="menubar">/g, '<ul>');
        fs.writeFileSync('frontend/src/Layout.jsx', layoutCode);
        console.log('Fixed Layout.jsx mobile menu <ul> class');
    }
}

// 2. FIX index.html (add flex: 1 and width: auto to bottom menu children)
let htmlCode = fs.readFileSync('frontend/index.html', 'utf8');

const additionalCss = `
.elementor-element-75b9e865 .elementor-element-2628cf49 > .elementor-element {
    width: auto !important;
    flex: 1 !important;
    min-width: 0 !important;
}
`;

if (!htmlCode.includes('elementor-element-2628cf49 > .elementor-element')) {
    htmlCode = htmlCode.replace('</style>', additionalCss + '\n</style>');
    fs.writeFileSync('frontend/index.html', htmlCode);
    console.log('Fixed index.html bottom menu CSS');
} else {
    console.log('index.html CSS already fixed');
}
