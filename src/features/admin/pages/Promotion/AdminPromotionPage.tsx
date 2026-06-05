import { AdminBulletinManager } from '../../components/AdminBulletinManager';

export function AdminPromotionPage() {
  return (
    <AdminBulletinManager
      type="promotion"
      heading="Danh sách khuyến mãi"
      description="Quản lý nội dung khuyến mãi và ưu đãi."
      sectionPath="/admin/khuyen-mai"
    />
  );
}
