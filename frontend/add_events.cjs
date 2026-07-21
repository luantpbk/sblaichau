const fs = require('fs');
let content = fs.readFileSync('src/Layout.jsx', 'utf8');

const regex = /useEffect\(\(\) => \{\n\s*if \(\!document\.getElementById\('force-mobile-menu-css'\)\) \{/;

const newUseEffect = `useEffect(() => {
    const handleZalo = () => setIsZaloOpen(true);
    const handleContact = () => setIsContactOpen(true);
    window.addEventListener('openZaloPopup', handleZalo);
    window.addEventListener('openContactPopup', handleContact);

    if (!document.getElementById('force-mobile-menu-css')) {`;

content = content.replace(regex, newUseEffect);

const cleanupRegex = /document\.head\.appendChild\(style\);\n\s*\}\n\s*\}, \[\]\);/;

const newCleanup = `document.head.appendChild(style);
    }
    
    return () => {
        window.removeEventListener('openZaloPopup', handleZalo);
        window.removeEventListener('openContactPopup', handleContact);
    };
  }, []);`;

content = content.replace(cleanupRegex, newCleanup);

fs.writeFileSync('src/Layout.jsx', content);
console.log('Done replacing using regex!');
