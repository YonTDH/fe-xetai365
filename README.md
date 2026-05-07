# FE XeTai365

Demo: https://fe-xetai365.vercel.app/

Frontend cho website XeTai365, gồm public site cho người dùng cuối và admin CMS cho đội ngũ vận hành nội dung. Dự án được xây bằng React + TypeScript + Vite và giao tiếp với backend qua REST API.

## Mục tiêu dự án

- Hiển thị danh mục và chi tiết sản phẩm xe tải theo cấu trúc phân cấp.
- Quản lý nội dung marketing như tin tức, khuyến mãi, dịch vụ, tuyển dụng.
- Thu thập yêu cầu liên hệ từ khách hàng và theo dõi ở admin.
- Cho phép đội vận hành cập nhật nội dung và media mà không cần sửa code frontend.

## Tính năng chính

### Public site

- Trang chủ lấy dữ liệu động cho hero, sản phẩm nổi bật và tin mới.
- Trang giới thiệu doanh nghiệp và showroom.
- Danh mục sản phẩm theo cấp 1, cấp 2 và trang chi tiết sản phẩm.
- Các chuyên mục tin tức, khuyến mãi, dịch vụ, tuyển dụng và trang chi tiết bài viết.
- Form liên hệ có validate phía client và gửi dữ liệu về backend.

### Admin CMS

- Đăng nhập admin bằng access token.
- CRUD danh mục sản phẩm cấp 1 và cấp 2.
- CRUD sản phẩm với metadata SEO cơ bản.
- CRUD nội dung About Us, showroom, tin tức, khuyến mãi, dịch vụ, tuyển dụng.
- Theo dõi yêu cầu liên hệ, đánh dấu đã xem và cập nhật trạng thái xử lý.
- Upload ảnh qua luồng signed upload với Cloudinary.
- Import nội dung từ file `.docx` cho bulletin và sản phẩm.

## Tech stack

- React 19
- TypeScript 5
- Vite 8
- React Router 7
- Tailwind CSS 4
- Radix-based UI primitives + utility components
- ESLint 9
- Vercel

## Cấu trúc thư mục

```text
src/
  api/                API clients cho public site
  components/         UI dùng lại
  features/admin/     Admin pages, components, API adapters
  lib/                helpers và formatter
  pages/              public pages
  routes/             định nghĩa route
  templates/          layout tổng
public/               static assets
```

## Yêu cầu môi trường

- Node.js `20+`
- npm `10+`
- Backend API đang chạy và cho phép CORS từ frontend

Biến môi trường tối thiểu:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Lưu ý: khi deploy production, cần set `VITE_API_BASE_URL` trỏ tới backend thật. Nếu bỏ trống, frontend hiện tại sẽ fallback về `http://localhost:3000`.

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Mặc định app chạy qua Vite tại `http://localhost:5173`.

## Scripts

- `npm run dev`: chạy môi trường development
- `npm run build`: type-check và build production
- `npm run lint`: chạy ESLint
- `npm run preview`: preview bản build local

## API integration

Các nhóm endpoint chính đang được frontend sử dụng:

- `/api/content/home`
- `/api/catalog/categories/tree`
- `/api/catalog/products`
- `/api/contact-requests`
- `/api/settings`
- `/api/admin/auth/*`
- `/api/admin/bulletins/*`
- `/api/admin/products/*`
- `/api/admin/vehicle-categories/*`
- `/api/admin/uploads/signature`
