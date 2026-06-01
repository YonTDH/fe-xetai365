import { useEffect, useState } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '../api/adminApi';

type AdminHeaderProps = {
  title: string;
  description: string;
  user: AdminUser;
  onLogout: () => void;
};

function formatVNTime(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const suffix = isAM ? 'SA' : 'CH';
  hours %= 12;
  if (hours === 0) {
    hours = 12;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

function formatVNDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function AdminHeader({ title, description, user, onLogout }: AdminHeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <header className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-200 bg-slate-950 px-4 py-3 text-white md:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-5 text-white">XeTai365</div>
            <p className="truncate text-xs font-medium text-slate-100">Bảng quản trị nội dung</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-100">
            <span className="font-semibold text-white">{user.fullName || user.username}</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-400 sm:block" />
            <span>{`${formatVNTime(now)} - ${formatVNDate(now)}`}</span>
          </div>

          <div className="group/logout relative inline-flex w-fit">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={onLogout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="border-white/25 bg-white/10 text-white hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover/logout:opacity-100 group-focus-within/logout:opacity-100">
              Đăng xuất
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 md:px-5">
        <h1 className="truncate text-xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 font-medium text-slate-700">{description}</p>
      </div>
    </header>
  );
}
