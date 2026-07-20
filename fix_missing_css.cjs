const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.css') || file.endsWith('.js')) {
            // Check if filename ends with 4 hex chars before .css/.js
            const ext = path.extname(file);
            const regex = new RegExp(`^(.*)([a-f0-9]{4})${ext}$`, 'i');
            const match = file.match(regex);
            
            if (match) {
                const base = match[1];
                
                // Avoid stripping post IDs like post-7121.css (base would be post-)
                if (base.endsWith('-') || base === '') continue;
                
                const newName = base + ext;
                const newPath = path.join(dir, newName);
                if (!fs.existsSync(newPath)) {
                    console.log(`Copying ${file} to ${newName}`);
                    fs.copyFileSync(fullPath, newPath);
                }
            }
        }
    }
}

walkDir(path.join(__dirname, 'frontend', 'public', 'assets'));
