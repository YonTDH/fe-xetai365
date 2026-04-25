import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { adminLogin, adminMe, clearAdminToken, getAdminToken } from '../api/adminApi';
import { DEFAULT_ADMIN_SECTION, getAdminSectionPath } from '../config/menu';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

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
        await adminMe();
        if (!mounted) return;
        setIsAuthenticated(true);
      } catch {
        clearAdminToken();
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

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError('');
      await adminLogin(username, password);
      navigate(getAdminSectionPath(DEFAULT_ADMIN_SECTION), { replace: true });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Không thể đăng nhập admin.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-600">Đang kiểm tra đăng nhập admin...</div>
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getAdminSectionPath(DEFAULT_ADMIN_SECTION)} replace />;
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md border border-slate-200 bg-white shadow-xl">
        <CardHeader className="border-b border-slate-200 text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-900">
            <ShieldCheck className="h-6 w-6 text-primary-600" />
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {loginError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div>}
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Username</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Password</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <Button type="button" className="w-full" onClick={() => void handleLogin()} disabled={isLoggingIn}>
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
