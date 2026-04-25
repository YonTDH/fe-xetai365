import { AdminPlaceholderPanel } from '../components/AdminPlaceholderPanel';
import type { AdminSectionKey } from '../config/menu';
import { AdminCategoryLevel1Page } from './Category-lv1/AdminCategoryLevel1Page';
import { AdminNewsPage } from './AdminNewsPage';
import { AdminPromotionPage } from './AdminPromotionPage';
import { AdminRecruitmentPage } from './AdminRecruitmentPage';

export function AdminSectionContent({ section }: { section: AdminSectionKey }) {
  switch (section) {
    case 'product-category-level-1':
      return <AdminCategoryLevel1Page />;
    case 'news':
      return <AdminNewsPage />;
    case 'recruitment':
      return <AdminRecruitmentPage />;
    case 'promotion':
      return <AdminPromotionPage />;
    default:
      return <AdminPlaceholderPanel section={section} />;
  }
}
