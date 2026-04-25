import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { adminMe, clearAdminToken, getAdminToken, type AdminUser } from '../api/adminApi';
import { AdminHeader } from '../components/AdminHeader';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  DEFAULT_ADMIN_SECTION,
  adminSectionMeta,
  getAdminSectionFromSlug,
  getAdminSectionPath,
  type AdminSectionKey,
} from '../config/menu';
import { AdminSectionContent } from './AdminSectionContent';

const DEFAULT_OPEN_KEYS: string[] = [];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { sectionSlug } = useParams<{ sectionSlug?: string }>();
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

  const activeSection = getAdminSectionFromSlug(sectionSlug) ?? (sectionSlug ? null : DEFAULT_ADMIN_SECTION);
  const activeMeta = activeSection ? adminSectionMeta[activeSection] : null;
  const pageTitle = useMemo(() => activeMeta?.title ?? '', [activeMeta]);

  const handleToggleGroup = (key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  const handleSelectSection = (section: AdminSectionKey) => {
    navigate(getAdminSectionPath(section));
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

  if (!sectionSlug) {
    return <Navigate to={getAdminSectionPath(DEFAULT_ADMIN_SECTION)} replace />;
  }

  if (!activeSection || !activeMeta) {
    return <Navigate to={getAdminSectionPath(DEFAULT_ADMIN_SECTION)} replace />;
  }

  return (
    <section className="min-h-screen bg-slate-50 [font-family:Tahoma,'Segoe_UI',sans-serif]">
      <AdminSidebar
        activeSection={activeSection}
        openKeys={openKeys}
        onToggleGroup={handleToggleGroup}
        onSelectSection={handleSelectSection}
      />

      <div className="min-h-screen xl:ml-72">
        <main className="p-4 md:p-6 xl:p-6">
          <AdminHeader title={pageTitle} description={activeMeta.description} user={user} onLogout={handleLogout} />
          <AdminSectionContent section={activeSection} />
        </main>
      </div>
    </section>
  );
}
