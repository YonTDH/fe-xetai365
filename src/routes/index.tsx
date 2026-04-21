import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/templates/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { PromotionPage } from '@/pages/PromotionPage';
import { NewsPage } from '@/pages/NewsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/khuyen-mai" element={<PromotionPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
