const fs = require('fs');
const code = fs.readFileSync('frontend/src/Layout.jsx', 'utf8');
const idx = code.indexOf('data-device="mobile"');
if(idx !== -1) {
    console.log(code.substring(idx - 100, idx + 2000));
} else {
    console.log('Not found');
}
