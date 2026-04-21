import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/templates/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
