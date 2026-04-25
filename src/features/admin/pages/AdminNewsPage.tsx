import { AdminBulletinManager } from '../components/AdminBulletinManager';

export function AdminNewsPage() {
  return (
    <AdminBulletinManager
      type="news_event"
      heading="Danh sách tin tức"
      description="Quản lý nội dung tin tức - sự kiện. User có thể nhập text thường, không bắt buộc phải biết HTML."
    />
  );
}
