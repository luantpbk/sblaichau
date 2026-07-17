#!/bin/bash
# Script Setup SSL (Let's Encrypt) cho sblaichau.vn
# Chạy với quyền Root trên máy chủ Linux của bạn

if [ "$EUID" -ne 0 ]; then
  echo "Vui lòng chạy script bằng quyền root (sudo)!"
  exit 1
fi

echo "======================================"
echo "    Bắt đầu cài đặt SSL Let's Encrypt   "
echo "======================================"

# 1. Cài đặt Certbot (dành cho Oracle Linux / RHEL 9)
echo ">>> Đang cài đặt Certbot..."
dnf install epel-release -y
dnf install certbot -y

# 2. Tạm dừng Nginx để Certbot có thể dùng port 80
echo ">>> Tạm dừng Nginx..."
systemctl stop nginx

# 3. Yêu cầu chứng chỉ SSL (Certonly Standalone)
echo ">>> Đang tạo chứng chỉ SSL cho sblaichau.vn, www.sblaichau.vn, admin.sblaichau.vn..."
certbot certonly --standalone \
  -d sblaichau.vn -d www.sblaichau.vn -d admin.sblaichau.vn \
  --non-interactive \
  --agree-tos \
  -m info@sblaichau.vn

# 4. Kiểm tra xem chứng chỉ đã được tạo thành công chưa
if [ -d "/etc/letsencrypt/live/sblaichau.vn" ]; then
    echo ">>> Tạo chứng chỉ SSL thành công!"
    echo ">>> Vui lòng chạy lệnh ./deploy.sh để cập nhật cấu hình Nginx và khởi động lại Web Server."
else
    echo ">>> Lỗi: Không thể tạo chứng chỉ SSL. Vui lòng kiểm tra lại DNS trỏ về IP của máy chủ."
    systemctl start nginx
    exit 1
fi
