import { BulletinListPage } from '@/pages/BulletinListPage';
import { listPromotions } from '@/api/bulletinsApi';

export function PromotionPage() {
  return (
    <BulletinListPage
      title="Khuyến mãi"
      activeTab="promotion"
      detailBasePath="/khuyen-mai"
      loadItems={listPromotions}
      loadingText="Đang tải chương trình khuyến mãi..."
      emptyText="Hiện chưa có chương trình khuyến mãi nào đang hiển thị."
      errorText="Không thể tải dữ liệu khuyến mãi."
    />
  );
}
