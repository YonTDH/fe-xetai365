import { AdminPlaceholderPanel } from '../components/AdminPlaceholderPanel';
import type { AdminSectionKey } from '../config/menu';
import { AdminAboutUsPage } from './AboutUs/AdminAboutUsPage';
import { AdminCategoryLevel1Page } from './Category-lv1/AdminCategoryLevel1Page';
import { AdminCategoryLevel2Page } from './Category-lv2/AdminCategoryLevel2Page';
import { AdminNewsPage } from './AdminNewsPage';
import { AdminPromotionPage } from './AdminPromotionPage';
import { AdminProductsPage } from './Products/AdminProductsPage';
import { AdminRecruitmentPage } from './AdminRecruitmentPage';

export function AdminSectionContent({ section }: { section: AdminSectionKey }) {
  switch (section) {
    case 'product-category-level-1':
      return <AdminCategoryLevel1Page />;
    case 'product-category-level-2':
      return <AdminCategoryLevel2Page />;
    case 'products':
      return <AdminProductsPage />;
    case 'about-us':
      return <AdminAboutUsPage />;
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
