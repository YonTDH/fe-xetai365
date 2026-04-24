import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '../api/adminApi';

type AdminHeaderProps = {
  title: string;
  description: string;
  user: AdminUser;
  onLogout: () => void;
};

export function AdminHeader({ title, description, user, onLogout }: AdminHeaderProps) {
  const initials = (user.fullName || user.username)
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="mb-6">
      <div className="grid items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Admin Panel</div>
          <h1 className="mt-2 truncate text-lg font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="hidden justify-center md:flex">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            XeTai365 CMS
          </div>
        </div>

        <div className="flex items-center justify-start gap-3 md:justify-end">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{user.fullName || user.username}</div>
              <div className="truncate text-xs text-slate-500">{user.username}</div>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
