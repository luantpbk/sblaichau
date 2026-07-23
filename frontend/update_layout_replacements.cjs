const fs = require("fs");
let layout = fs.readFileSync("src/Layout.jsx", "utf8");

const splitPoint = "  // Apply dynamic footer settings\r\n";
const parts = layout.split(splitPoint);

if (parts.length === 2) {
  const newCode = `  // Aggressive string replacement for the entire Layout
  const forceReplace = (str) => {
      let res = str;
      res = res.replace(/[a-zA-Z0-9._%+-]+@weltrus\\.com/gi, 'info@sblaichau.vn');
      res = res.replace(/support@sblaichau\\.vn/gi, 'info@sblaichau.vn');
      res = res.replace(/sales@weltrus\\.com/gi, 'info@sblaichau.vn');
      
      const phone = '0857.688.626';
      res = res.replace(/\\+86\\s*181\\s*5738\\s*8806|0573-86221160/gi, phone);
      res = res.replace(/400\\s*900\\s*8856/gi, phone);
      res = res.replace(/400-096-8566/gi, phone);
      res = res.replace(/4000968566/gi, phone);
      res = res.replace(/0986\\.072\\.277/gi, phone);
      res = res.replace(/0986072277/gi, phone);
      
      res = res.replace(/Điện thoại\\/WhatsApp/gi, 'Điện thoại/Zalo');
      res = res.replace(/WhatsApp/gi, 'Zalo');
      res = res.replace(/wa\\.me\\/\\+?\\d+/gi, 'zalo.me/0857688626');
      res = res.replace(/api\\.whatsapp\\.com\\/send\\?phone=\\+?\\d+/gi, 'zalo.me/0857688626');
      
      return res;
  };
  
  finalHeader = forceReplace(finalHeader);
  finalPreMain = forceReplace(finalPreMain);
  finalFooter = forceReplace(finalFooter);

`;

  fs.writeFileSync(
    "src/Layout.jsx",
    parts[0] + newCode + splitPoint + parts[1],
  );
  console.log("Successfully injected aggressive replacements");
} else {
  console.log("Failed to split Layout.jsx! Parts length: " + parts.length);
}
