const fs = require('fs');
let code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

// 1. Remove the old inline <style> block from finalPreMain
if (code.includes('<style id="force-bottom-menu-css">')) {
    const startIdx = code.indexOf('<style id="force-bottom-menu-css">');
    const endIdx = code.indexOf('</style>', startIdx) + 8;
    code = code.substring(0, startIdx) + code.substring(endIdx);
    console.log('Removed inline <style> block from Layout.jsx');
}

// 2. Inject useEffect block
const useEffectCode = `
  useEffect(() => {
    if (!document.getElementById('force-mobile-menu-css')) {
      const style = document.createElement('style');
      style.id = 'force-mobile-menu-css';
      style.innerHTML = \`
        @media (max-width: 767px) {
            body .elementor-element-75b9e865.elementor-element-75b9e865 {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                background: #fff !important;
                z-index: 999999 !important;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
                padding: 8px 0 !important;
                display: block !important;
                margin: 0 !important;
                transform: none !important;
            }
            body .elementor-element-75b9e865 .elementor-element-2628cf49.elementor-element-2628cf49 {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-around !important;
                align-items: center !important;
                width: 100% !important;
                flex-wrap: nowrap !important;
            }
            body .elementor-element-75b9e865 .elementor-element-2628cf49 > .elementor-element {
                width: auto !important;
                flex: 1 !important;
                min-width: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            body .elementor-element-75b9e865 .elementor-widget-icon-box .elementor-icon-box-wrapper,
            body .elementor-element-75b9e865 .elementor-widget-icon .elementor-icon-wrapper {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
            }
            body .elementor-element-75b9e865 .elementor-heading-title {
                font-size: 11px !important;
                margin-top: 5px !important;
                text-align: center !important;
                line-height: 1 !important;
            }
            body .elementor-element-75b9e865 .elementor-widget {
                margin-bottom: 0 !important;
            }
        }
      \`;
      document.head.appendChild(style);
    }
  }, []);
`;

if (!code.includes('force-mobile-menu-css')) {
    code = code.replace('useEffect(() => {', useEffectCode + '\n  useEffect(() => {');
    fs.writeFileSync('frontend/src/Layout.jsx', code);
    console.log('Injected useEffect CSS into Layout.jsx');
} else {
    console.log('useEffect CSS already in Layout.jsx');
}
