const fs = require('fs');
const code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');

const mobileIdx = code.indexOf('class="mobile-menu');
console.log(code.substring(mobileIdx, mobileIdx + 500));
