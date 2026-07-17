const fs = require('fs');
let code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

// Replace the old useEffect with the correct one!
const oldUseEffectRegex = /useEffect\(\(\) => \{\n\s*if \(\!document\.getElementById\('force-mobile-menu-css'\)\)[\s\S]*?document\.head\.appendChild\(style\);\n\s*\}\n\s*\}, \[\]\);/g;

const newUseEffect = `
  useEffect(() => {
    if (!document.getElementById('force-mobile-menu-css')) {
      const style = document.createElement('style');
      style.id = 'force-mobile-menu-css';
      style.innerHTML = \`
        @media (max-width: 767px) {
            /* ROOT CONTAINER: Fixed to bottom, flex row */
            body .elementor-element-75b9e865.elementor-element-75b9e865 {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                max-width: 100vw !important;
                background: #fff !important;
                z-index: 999999 !important;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1) !important;
                padding: 10px 0 !important;
                margin: 0 !important;
                transform: none !important;
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-around !important;
                align-items: stretch !important;
                flex-wrap: nowrap !important;
            }
            
            /* EACH OF THE 5 MENU ITEMS: Flex column (icon above text) */
            body .elementor-element-75b9e865 > .e-child {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 1 !important;
                width: auto !important;
                min-width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 5px !important;
            }
            
            /* WIDGET WRAPPERS INSIDE MENU ITEMS: Reset widths */
            body .elementor-element-75b9e865 > .e-child > .elementor-widget {
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* ICON SIZING */
            body .elementor-element-75b9e865 .elementor-icon {
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            body .elementor-element-75b9e865 .elementor-icon svg {
                width: 20px !important;
                height: 20px !important;
                fill: #22a349 !important; /* Force green color to match reference */
            }
            
            /* TEXT SIZING */
            body .elementor-element-75b9e865 .elementor-heading-title {
                font-size: 11px !important;
                font-weight: 600 !important;
                margin: 0 !important;
                padding: 0 !important;
                text-align: center !important;
                line-height: 1.2 !important;
                color: #555 !important;
            }
        }
      \`;
      document.head.appendChild(style);
    }
  }, []);
`;

if (code.match(oldUseEffectRegex)) {
    code = code.replace(oldUseEffectRegex, newUseEffect.trim());
    fs.writeFileSync('frontend/src/Layout.jsx', code);
    console.log('Successfully replaced useEffect CSS!');
} else {
    console.log('Failed to find old useEffect CSS!');
}
