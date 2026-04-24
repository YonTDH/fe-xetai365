import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminBulletinManager } from '../components/AdminBulletinManager';
import { AdminCategoryLevel1Manager } from '../components/AdminCategoryLevel1Manager';
import { AdminHeader } from '../components/AdminHeader';
import { AdminPlaceholderPanel } from '../components/AdminPlaceholderPanel';
import { AdminSidebar } from '../components/AdminSidebar';
import { adminSectionMeta, type AdminSectionKey } from '../config/menu';
import { adminMe, clearAdminToken, getAdminToken, type AdminUser } from '../api/adminApi';

const DEFAULT_OPEN_KEYS = ['products', 'banners'];
const DEFAULT_SECTION: AdminSectionKey = 'news';

export function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSectionKey>(DEFAULT_SECTION);
  const [openKeys, setOpenKeys] = useState<string[]>(DEFAULT_OPEN_KEYS);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = getAdminToken();
      if (!token) {
        if (mounted) {
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const me = await adminMe();
        if (!mounted) return;
        setUser(me);
      } catch {
        if (!mounted) return;
        clearAdminToken();
        setUser(null);
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const activeMeta = adminSectionMeta[activeSection];
  const pageTitle = useMemo(() => activeMeta.title, [activeMeta.title]);

  const handleToggleGroup = (key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const handleLogout = () => {
    clearAdminToken();
    setUser(null);
  };

  if (isCheckingAuth) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Đang kiểm tra đăng nhập admin...</div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <AdminSidebar
        activeSection={activeSection}
        openKeys={openKeys}
        onToggleGroup={handleToggleGroup}
        onSelectSection={setActiveSection}
      />

      <div className="min-h-screen xl:ml-72">
        <main className="p-4 md:p-6 xl:p-6">
          <AdminHeader title={pageTitle} description={activeMeta.description} user={user} onLogout={handleLogout} />

          {activeSection === 'product-category-level-1' && <AdminCategoryLevel1Manager />}

          {activeSection === 'news' && (
            <AdminBulletinManager
              type="news_event"
              heading="Danh sách tin tức"
              description="Quản lý nội dung tin tức - sự kiện. User có thể nhập text thường, không bắt buộc phải biết HTML."
            />
          )}

          {activeSection === 'recruitment' && (
            <AdminBulletinManager
              type="recruitment"
              heading="Danh sách tuyển dụng"
              description="Quản lý bài viết tuyển dụng với cùng form nội dung như tin tức."
            />
          )}

          {activeSection === 'promotion' && (
            <AdminBulletinManager
              type="promotion"
              heading="Danh sách khuyến mại"
              description="Quản lý nội dung khuyến mại và ưu đãi."
            />
          )}

          {!['product-category-level-1', 'news', 'recruitment', 'promotion'].includes(activeSection) && (
            <AdminPlaceholderPanel section={activeSection} />
          )}
        </main>
      </div>
    </section>
  );
}
