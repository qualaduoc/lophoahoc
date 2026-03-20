# Nền Tảng Hóa Học EdTech (ChemEd)
## Hướng Dẫn Thiết Lập & Khởi Chạy

Dự án đã được thiết lập với React (Vite), Tailwind CSS, PWA, và cấu trúc Supabase như yêu cầu. 

### Bước 1: Khởi chạy dự án (Local)
1. Mở Terminal trong thư mục `d:\nodejs\lophoahoc`
2. Chạy lệnh: `npm run dev`
3. Truy cập vào đường link hiển thị (thường là `http://localhost:5173`) để trải nghiệm giao diện.

### Bước 2: Thiết lập Cơ sở dữ liệu Supabase
1. Đăng nhập/Đăng ký tại [Supabase](https://supabase.com). Tạo một Project mới.
2. Mở mục **SQL Editor** trong bảng điều khiển Supabase của bạn.
3. Mở file `supabase_schema.sql` (nằm ở thư mục gốc của dự án này).
4. Dán toàn bộ mã SQL vào Supabase SQL Editor và nhấn **Run**. Thao tác này sẽ tự động tạo các bảng, gắn Row Level Security (RLS) để phân quyền an toàn giữa Giáo viên / Học sinh và thiết lập Gameification (danh hiệu).
5. (Tuỳ chọn) Tạo file `.env` ở thư mục gốc của dự án với nội dung:
```
VITE_SUPABASE_URL=link-project-cua-ban
VITE_SUPABASE_ANON_KEY=anon-key-cua-ban
```

### Bước 3: Kiểm tra các tính năng cốt lõi
- Khám phá **Phòng thí nghiệm ảo** có nhúng PhET Simulation.
- Khám phá **Bảng tuần hoàn tương tác** mượt mà với Tailwind CSS (Glassmorphism).
- Vào mục **Bài tập** để quan sát cảnh báo của hệ thống **Anti-Cheat Guard** (Bạn có thể thử mở tab khác để xem cảnh báo).

### Bước 4: Chuyển đổi thành PWA và Triển khai (Deploy)
1. **GitHub**: Khởi tạo Git repo (`git init`), add và commit mã nguồn, sau đó đẩy (push) lên GitHub.
2. **Vercel**: Truy cập [Vercel](https://vercel.com), thêm (import) Project từ GitHub của bạn. Vercel sẽ tự động nhận diện Vite và cài đặt. Đừng quên thiết lập Biến môi trường (Environment Variables) cho Supabase trên Vercel.
3. Ứng dụng sau khi cài hiển thị nút tải PWA trên thanh điều hướng để học sinh có thể dễ dàng tải xuống điện thoại hoặc máy tính.
