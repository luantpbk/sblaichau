#!/bin/bash
# Script Deployment for sblaichau.vn (Run as Root)
# Designed for Oracle Linux 9 VM

# Đảm bảo script được chạy bởi root (đã gõ su - trước đó)
if [ "$EUID" -ne 0 ]; then
  echo "Vui lòng chạy script bằng quyền root!"
  exit 1
fi

# Lấy đường dẫn thư mục chứa script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "======================================"
echo "    Bắt đầu quá trình Deployment      "
echo "======================================"

# 1. Kéo mã nguồn mới nhất
echo ">>> [1/4] Đang cập nhật mã nguồn tại $DIR..."
cd "$DIR" || { echo "Lỗi: Không thể truy cập thư mục $DIR"; exit 1; }
git checkout main
git pull origin main

# 2. Deploy Backend
echo ">>> [2/4] Đang cài đặt và khởi động lại Backend..."
cd "$DIR/backend"
npm install --legacy-peer-deps
npx prisma generate
# Khởi động lại bằng PM2. Nếu chưa có tiến trình sblaichau-backend thì tạo mới
pm2 restart sblaichau-backend || pm2 start index.js --name "sblaichau-backend"
pm2 save

# 3. Build Frontend
echo ">>> [3/4] Đang cài đặt và build Frontend..."
cd "$DIR/frontend"
npm install --legacy-peer-deps
npm run build

# 4. Build Admin
echo ">>> [4/4] Đang cài đặt và build Admin..."
cd "$DIR/admin"
npm install --legacy-peer-deps
npm run build

# 5. Nginx Configuration
echo ">>> Đang cập nhật cấu hình Nginx..."
cp "$DIR/sblaichau.conf" /etc/nginx/conf.d/sblaichau.conf
systemctl restart nginx

echo "======================================"
echo "    Deployment Hoàn tất Thành công!   "
echo "======================================"
