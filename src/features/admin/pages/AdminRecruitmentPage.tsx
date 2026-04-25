import { AdminBulletinManager } from '../components/AdminBulletinManager';

export function AdminRecruitmentPage() {
  return (
    <AdminBulletinManager
      type="recruitment"
      heading="Danh sách tuyển dụng"
      description="Quản lý bài viết tuyển dụng với cùng form nội dung như tin tức."
    />
  );
}
