import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/templates/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { PromotionPage } from '@/pages/PromotionPage';
import { NewsPage } from '@/pages/NewsPage';
import { BulletinDetailPage } from '@/pages/BulletinDetailPage';
import { NewsDetailPage } from '@/pages/NewsDetailPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/tin-tuc/:idOrSlug" element={<NewsDetailPage />} />
        <Route path="/khuyen-mai" element={<PromotionPage />} />
        <Route path="/khuyen-mai/:idOrSlug" element={<BulletinDetailPage sectionLabel="Khuyến mãi" backPath="/khuyen-mai" />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
