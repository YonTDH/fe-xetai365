import { BulletinListPage } from '@/pages/BulletinListPage';
import { listRecruitments } from '@/api/bulletinsApi';

export function RecruitmentPage() {
  return (
    <BulletinListPage
      title="Tuyển dụng"
      activeTab="recruitment"
      detailBasePath="/tuyen-dung"
      loadItems={listRecruitments}
      loadingText="Đang tải thông tin tuyển dụng..."
      emptyText="Hiện chưa có tin tuyển dụng nào đang hiển thị."
      errorText="Không thể tải dữ liệu tuyển dụng."
    />
  );
}
