const fs = require('fs');

let layoutCode = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

const additionalCss = `
<style id="force-bottom-menu-css">
@media (max-width: 1024px) {
    .elementor-element-75b9e865 {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        background: #fff !important;
        z-index: 999999 !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
        padding: 8px 0 !important;
        display: block !important;
        margin: 0 !important;
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
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
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
</style>
`;

if (!layoutCode.includes('force-bottom-menu-css')) {
    layoutCode = layoutCode.replace(
        '<div class="elementor-element elementor-element-75b9e865',
        additionalCss + '<div class="elementor-element elementor-element-75b9e865'
    );
    fs.writeFileSync('frontend/src/Layout.jsx', layoutCode);
    console.log('Injected <style> block directly into Layout.jsx HTML string!');
} else {
    console.log('Layout.jsx already has force-bottom-menu-css');
}
