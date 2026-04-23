import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/templates/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { PromotionPage } from '@/pages/PromotionPage';
import { RecruitmentPage } from '@/pages/RecruitmentPage';
import { NewsPage } from '@/pages/NewsPage';
import { BulletinDetailPage } from '@/pages/BulletinDetailPage';
import { NewsDetailPage } from '@/pages/NewsDetailPage';
import { ProductCategoryPage } from '@/pages/ProductCategoryPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/san-pham/:slug" element={<ProductCategoryPage />} />
        <Route path="/san-pham/:parent/:child" element={<ProductCategoryPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/tin-tuc/:idOrSlug" element={<NewsDetailPage />} />
        <Route path="/khuyen-mai" element={<PromotionPage />} />
        <Route
          path="/khuyen-mai/:idOrSlug"
          element={<BulletinDetailPage sectionLabel="Khuy\u1EBFn m\u00E3i" backPath="/khuyen-mai" />}
        />
        <Route path="/tuyen-dung" element={<RecruitmentPage />} />
        <Route
          path="/tuyen-dung/:idOrSlug"
          element={<BulletinDetailPage sectionLabel="Tuy\u1EC3n d\u1EE5ng" backPath="/tuyen-dung" />}
        />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
