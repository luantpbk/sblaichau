const fs = require('fs');
const code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

// Find the block containing the bottom menu
let emailIdx = code.indexOf('2be38781'); // Home icon
let startContainer = code.lastIndexOf('<div class="elementor-element', emailIdx);
for(let i=0; i<5; i++) {
   startContainer = code.lastIndexOf('<div class="elementor-element', startContainer - 1);
}

console.log(code.substring(startContainer, emailIdx + 200));
