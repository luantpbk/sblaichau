const fs = require('fs');

// 1. Fix Layout.jsx (properly remove class="menu" despite spaces)
let layoutCode = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');
if (layoutCode.includes('class="mobile-menu')) {
    layoutCode = layoutCode.replace(/<ul\s+class="menu"\s+role="menubar">/g, '<ul>');
    layoutCode = layoutCode.replace(/<ul\s*class="menu"\s*role="menubar">/g, '<ul>');
    fs.writeFileSync('frontend/src/Layout.jsx', layoutCode);
    console.log('Fixed Layout.jsx mobile menu <ul> class');
}

// 2. Fix CSS (inject into index.css instead of index.html)
let indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
const additionalCss = `
/* Mobile Bottom Sticky Menu Layout Fix */
@media (max-width: 1024px) {
    .elementor-element-75b9e865 {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        background: #fff !important;
        z-index: 99999 !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
        padding: 8px 0 !important;
        display: block !important;
    }
    .elementor-element-75b9e865 .elementor-element-2628cf49 {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-around !important;
        align-items: center !important;
        width: 100% !important;
        flex-wrap: nowrap !important;
    }
    .elementor-element-75b9e865 .elementor-element-2628cf49 > .elementor-element {
        width: auto !important;
        flex: 1 !important;
        min-width: 0 !important;
    }
    .elementor-element-75b9e865 .elementor-widget-icon-box .elementor-icon-box-wrapper,
    .elementor-element-75b9e865 .elementor-widget-icon .elementor-icon-wrapper {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
    }
    .elementor-element-75b9e865 .elementor-heading-title {
        font-size: 11px !important;
        margin-top: 5px !important;
        text-align: center !important;
        line-height: 1 !important;
    }
    .elementor-element-75b9e865 .elementor-widget {
        margin-bottom: 0 !important;
    }
}
`;

if (!indexCss.includes('Mobile Bottom Sticky Menu Layout Fix')) {
    fs.appendFileSync('frontend/src/index.css', additionalCss);
    console.log('Injected bottom menu CSS into index.css');
} else {
    console.log('CSS already in index.css');
}
