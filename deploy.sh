#!/bin/bash
# Script Deployment for sblaichau.vn (Run as Root)
# Designed for Oracle Linux 9 VM

# Đảm bảo script được chạy bởi root (đã gõ su - trước đó)
if [ "$EUID" -ne 0 ]; then
  echo "Vui lòng chạy script bằng quyền root!"
  exit 1
fi

echo "======================================"
echo "    Bắt đầu quá trình Deployment      "
echo "======================================"

# 1. Kéo mã nguồn mới nhất
echo ">>> [1/4] Đang cập nhật mã nguồn..."
cd /sblaichau || { echo "Lỗi: Không tìm thấy thư mục /sblaichau. Vui lòng git clone mã nguồn trước."; exit 1; }
git checkout main
git pull origin main

# 2. Deploy Backend
echo ">>> [2/4] Đang cài đặt và khởi động lại Backend..."
cd /sblaichau/backend
npm install --legacy-peer-deps
npx prisma generate
# Khởi động lại bằng PM2. Nếu chưa có tiến trình sblaichau-backend thì tạo mới
pm2 restart sblaichau-backend || pm2 start index.js --name "sblaichau-backend"
pm2 save

# 3. Build Frontend
echo ">>> [3/4] Đang cài đặt và build Frontend..."
cd /sblaichau/frontend
npm install --legacy-peer-deps
npm run build

# 4. Build Admin
echo ">>> [4/4] Đang cài đặt và build Admin..."
cd /sblaichau/admin
npm install --legacy-peer-deps
npm run build

# 5. Nginx Configuration
echo ">>> Đang cập nhật cấu hình Nginx..."
cp /sblaichau/sblaichau.conf /etc/nginx/conf.d/sblaichau.conf
systemctl restart nginx

echo "======================================"
echo "    Deployment Hoàn tất Thành công!   "
echo "======================================"
