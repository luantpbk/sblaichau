const fs = require('fs');
let content = fs.readFileSync('src/Layout.jsx', 'utf8');

// 1. Replace the broken JSX syntax inside the HTML template strings with valid global onclick events
const brokenZalo = `href="#" onClick={(e) => { e.preventDefault(); setIsZaloOpen(true); }}`;
content = content.replace(new RegExp(brokenZalo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openZaloPopup'));"`);

const brokenContact = `href="#" onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}`;
content = content.replace(new RegExp(brokenContact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `href="#" onclick="event.preventDefault(); window.dispatchEvent(new Event('openContactPopup'));"`);

fs.writeFileSync('src/Layout.jsx', content);
console.log('Fixed broken onClick in template literals!');
