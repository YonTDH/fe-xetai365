import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/templates/MainLayout';
import { LandingPage } from '@/pages/LandingPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
    </Routes>
  );
}
