const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

const oldApplyDynamicSettings = `  const applyDynamicSettings = (content) => {
      if (!content) return content;
      const email = settingsRef.current.find(s => s.key === 'footer_email')?.value || 'info@sblaichau.vn';
      const p1 = settingsRef.current.find(s => s.key === 'footer_phone1')?.value || '0964.822.438';
      const p2 = settingsRef.current.find(s => s.key === 'footer_phone2')?.value || '0986.072.277';
      const address = settingsRef.current.find(s => s.key === 'footer_address')?.value || 'Lai Châu, Việt Nam';
      let newContent = content.replace(/https?:\\/\\/(www\\.)?weltrus\\.com\\/wp-content\\//gi, '/assets/');
      newContent = newContent.replace(/sales@weltrus\\.com/gi, email);
      newContent = newContent.replace(/\\+86\\s*181\\s*5738\\s*8806|0573-86221160/gi, p1);
      newContent = newContent.replace(/400\\s*900\\s*8856/gi, p2);
      newContent = newContent.replace(/Hangzhou,\\s*China|Zhejiang\\s*Province,\\s*China/gi, address);
      newContent = newContent.replace(/weltrus\\.com/gi, 'sblaichau.vn');
      return newContent;
  };`;

const newApplyDynamicSettings = `  const applyDynamicSettings = (content) => {
      if (!content) return content;
      const email = 'info@sblaichau.vn';
      const phone = '0964.822.438';
      const address = settingsRef.current.find(s => s.key === 'footer_address')?.value || 'Lai Châu, Việt Nam';
      let newContent = content.replace(/https?:\\/\\/(www\\.)?weltrus\\.com\\/wp-content\\//gi, '/assets/');
      
      // Replace all variations of old emails with info@sblaichau.vn
      newContent = newContent.replace(/[a-zA-Z0-9._%+-]+@weltrus\\.com/gi, email);
      newContent = newContent.replace(/support@sblaichau\\.vn/gi, email);
      
      // Replace all old phone numbers
      newContent = newContent.replace(/\\+86\\s*181\\s*5738\\s*8806|0573-86221160/gi, phone);
      newContent = newContent.replace(/400\\s*900\\s*8856/gi, phone);
      newContent = newContent.replace(/400-096-8566/gi, phone);
      newContent = newContent.replace(/4000968566/gi, phone);
      newContent = newContent.replace(/0986\\.072\\.277/gi, phone);
      newContent = newContent.replace(/0986072277/gi, phone);
      
      // Replace WhatsApp references to Zalo
      newContent = newContent.replace(/Điện thoại\\/WhatsApp/gi, 'Điện thoại/Zalo');
      newContent = newContent.replace(/WhatsApp/gi, 'Zalo');
      newContent = newContent.replace(/wa\\.me\\/\\+?\\d+/gi, 'zalo.me/0964822438');
      newContent = newContent.replace(/api\\.whatsapp\\.com\\/send\\?phone=\\+?\\d+/gi, 'zalo.me/0964822438');
      
      // Address and domain
      newContent = newContent.replace(/Hangzhou,\\s*China|Zhejiang\\s*Province,\\s*China/gi, address);
      newContent = newContent.replace(/weltrus\\.com/gi, 'sblaichau.vn');
      
      return newContent;
  };`;

if (app.includes(oldApplyDynamicSettings)) {
    app = app.replace(oldApplyDynamicSettings, newApplyDynamicSettings);
    fs.writeFileSync('src/App.jsx', app);
    console.log('Successfully updated App.jsx applyDynamicSettings');
} else {
    console.log('Could not find oldApplyDynamicSettings in App.jsx. Using regex fallback...');
    // regex fallback to replace the function entirely
    const regex = /const applyDynamicSettings = \(content\) => \{[\s\S]*?return newContent;\s*\};/;
    app = app.replace(regex, newApplyDynamicSettings);
    fs.writeFileSync('src/App.jsx', app);
    console.log('Used regex fallback to update App.jsx');
}
