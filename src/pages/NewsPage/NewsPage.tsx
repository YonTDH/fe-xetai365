import { BulletinListPage } from '@/pages/BulletinListPage';
import { listNewsEvents } from '@/api/bulletinsApi';

export function NewsPage() {
  return (
    <BulletinListPage
      title="Thông tin - sự kiện"
      activeTab="news"
      detailBasePath="/tin-tuc"
      loadItems={listNewsEvents}
      loadingText="Đang tải tin tức - sự kiện..."
      emptyText="Hiện chưa có bài viết thông tin - sự kiện nào."
      errorText="Không thể tải danh sách tin tức."
    />
  );
}
