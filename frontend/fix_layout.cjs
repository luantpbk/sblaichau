const fs = require('fs');
let content = fs.readFileSync('src/Layout.jsx', 'utf8');

// 1. Replace the broken JSX syntax inside the HTML template strings with valid global onclick events
const brokenZalo = `href="#" onClick={(e) => { e.preventDefault(); setIsZaloOpen(true); }}`;
content = content.replace(new RegExp(brokenZalo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openZaloPopup'));"`);

const brokenContact = `href="#" onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}`;
content = content.replace(new RegExp(brokenContact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));"`);

// 2. Add the event listener to useEffect
const useEffectRegex = /useEffect\(\(\) => \{\n\s*if \(\!document\.getElementById\('force-mobile-menu-css'\)\)/;
const newUseEffect = `useEffect(() => {
    const handleZalo = () => setIsZaloOpen(true);
    const handleContact = () => setIsContactOpen(true);
    window.addEventListener('openZaloPopup', handleZalo);
    window.addEventListener('openContactPopup', handleContact);
    
    if (!document.getElementById('force-mobile-menu-css'))`;

content = content.replace(useEffectRegex, newUseEffect);

// 3. Add the cleanup for the event listeners
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
console.log('Fixed syntax and added event listeners!');
