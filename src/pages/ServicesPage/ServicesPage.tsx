import { BulletinListPage } from '@/pages/BulletinListPage';
import { listServices } from '@/api/bulletinsApi';

export function ServicesPage() {
  return (
    <BulletinListPage
      title="Dịch vụ"
      activeTab="services"
      detailBasePath="/dich-vu"
      loadItems={listServices}
      loadingText="Đang tải thông tin dịch vụ..."
      emptyText="Hiện chưa có bài viết dịch vụ nào đang hiển thị."
      errorText="Không thể tải dữ liệu dịch vụ."
    />
  );
}
