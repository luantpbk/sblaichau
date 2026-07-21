const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'frontend/src/Layout.jsx');
let content = fs.readFileSync(layoutPath, 'utf8');

const replacements = [
    { target: />SOLUTIONS</g, replace: '>Giải pháp<' },
    { target: /"Search for\.\.\."/g, replace: '"Tìm kiếm..."' },
    { target: /placeholder="Search"/g, replace: 'placeholder="Tìm kiếm"' },
    { target: /"Search"/g, replace: '"Tìm kiếm"' },
    { target: /Read more about these purposes/g, replace: 'Tìm hiểu thêm về các mục đích này' },
    { target: /"show_more_text":"Show more"/g, replace: '"show_more_text":"Xem thêm"' },
    { target: /"more_text":"More"/g, replace: '"more_text":"Thêm"' },
    { target: /"search_live_results":"Search results"/g, replace: '"search_live_results":"Kết quả tìm kiếm"' },
    { target: /"search_live_no_result":"No results"/g, replace: '"search_live_no_result":"Không có kết quả"' },
    { target: /"search_live_one_result":"You got %s result. Please press Tab to select it."/g, replace: '"search_live_one_result":"Có %s kết quả. Bấm Tab để chọn."' },
    { target: /"search_live_many_results":"You got %s results. Please press Tab to select one."/g, replace: '"search_live_many_results":"Có %s kết quả. Bấm Tab để chọn."' },
    { target: /"expand_submenu":"Expand dropdown menu"/g, replace: '"expand_submenu":"Mở rộng menu"' },
    { target: /"collapse_submenu":"Collapse dropdown menu"/g, replace: '"collapse_submenu":"Thu gọn menu"' },
    // Also "Sản phẩm" was corrupted as "Sn phcm", let's fix it if it exists.
    { target: />Sn phcm</g, replace: '>Sản phẩm<' }
];

let replaced = content;
for (const {target, replace} of replacements) {
    replaced = replaced.replace(target, replace);
}

fs.writeFileSync(layoutPath, replaced, 'utf8');
console.log('Layout.jsx translated.');
