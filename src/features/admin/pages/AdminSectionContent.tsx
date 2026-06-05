import { AdminPlaceholderPanel } from '../components/AdminPlaceholderPanel';
import type { AdminSectionKey } from '../config/menu';
import { AdminAboutUsPage } from './AboutUs/AdminAboutUsPage';
import { AdminLogoPage } from './Banner/AdminLogoPage';
import { AdminSlidesPage } from './Banner/AdminSlidesPage';
import { AdminContactRequestsPage } from './AdminContactRequestsPage';
import { AdminCategoryLevel1Page } from './Category-lv1/AdminCategoryLevel1Page';
import { AdminCategoryLevel2Page } from './Category-lv2/AdminCategoryLevel2Page';
import { AdminProductsPage } from './Products/AdminProductsPage';
import { AdminNewsPage } from './News/AdminNewsPage';
import { AdminPromotionPage } from './Promotion/AdminPromotionPage';
import { AdminRecruitmentPage } from './Recruitment/AdminRecruitmentPage';
import { AdminServicesPage } from './Services/AdminServicesPage';
import { AdminShowroomPage } from './Showroom/AdminShowroomPage';

export function AdminSectionContent({
  section,
  onContactRequestsViewed,
}: {
  section: AdminSectionKey;
  onContactRequestsViewed?: () => Promise<void> | void;
}) {
  switch (section) {
    case 'product-category-level-1':
      return <AdminCategoryLevel1Page />;
    case 'product-category-level-2':
      return <AdminCategoryLevel2Page />;
    case 'products':
      return <AdminProductsPage />;
    case 'about-us':
      return <AdminAboutUsPage />;
    case 'showroom':
      return <AdminShowroomPage />;
    case 'news':
      return <AdminNewsPage />;
    case 'recruitment':
      return <AdminRecruitmentPage />;
    case 'promotion':
      return <AdminPromotionPage />;
    case 'services':
      return <AdminServicesPage />;
    case 'contact-requests':
      return <AdminContactRequestsPage onViewedChange={onContactRequestsViewed} />;
    case 'favicon':
      return <AdminLogoPage />;
    case 'slides':
      return <AdminSlidesPage />;
    default:
      return <AdminPlaceholderPanel section={section} />;
  }
}
