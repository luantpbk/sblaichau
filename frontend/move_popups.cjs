const fs = require('fs');

let content = fs.readFileSync('src/Layout.jsx', 'utf8');

// 1. Find the start of the popup block
const startMarker = '{isContactOpen && (';
const endMarker = "<script type='text/javascript'>\r\n\t\t\t\tconst lazyloadRunObserver";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find popup bounds. Start:", startIndex, "End:", endIndex);
    process.exit(1);
}

// 2. Extract the popup code
const popupCode = content.substring(startIndex, endIndex);

// 3. Remove popup code from the string literal
content = content.substring(0, startIndex) + content.substring(endIndex);

// 4. Inject it into the return statement before the closing Fragment
const returnSplit = content.split('      <div dangerouslySetInnerHTML={{ __html: finalFooter }} />\r\n    </>\r\n  );\r\n}');

if (returnSplit.length !== 2) {
    console.error("Could not find return statement to inject into.");
    process.exit(1);
}

content = returnSplit[0] + '      <div dangerouslySetInnerHTML={{ __html: finalFooter }} />\n      {/* Native React Popups */}\n      ' + popupCode + '\n    </>\n  );\n}';

fs.writeFileSync('src/Layout.jsx', content);
console.log('Successfully moved popups!');
