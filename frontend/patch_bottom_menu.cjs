const fs = require('fs');
let html = fs.readFileSync('frontend/index.html', 'utf8');

const additionalCss = `
/* Mobile Bottom Sticky Menu Layout Fix */
.elementor-element-75b9e865 .elementor-element-2628cf49 {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-around !important;
    align-items: center !important;
    width: 100% !important;
    flex-wrap: nowrap !important;
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
/* Ensure the parent is fixed at bottom */
.elementor-element-75b9e865 {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    background: #fff !important;
    z-index: 99999 !important;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
    padding: 8px 0 !important;
}
.elementor-element-75b9e865 .elementor-widget {
    margin-bottom: 0 !important;
}
`;

if (!html.includes('Mobile Bottom Sticky Menu Layout Fix')) {
    html = html.replace('</style>', additionalCss + '\n</style>');
    fs.writeFileSync('frontend/index.html', html);
    console.log('Injected bottom sticky menu CSS.');
} else {
    console.log('Bottom sticky menu CSS already injected.');
}
