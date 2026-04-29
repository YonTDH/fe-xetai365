import { useEffect, useState } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

function formatVNDate(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function AdminHeader({ title, description, onLogout }: AdminHeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <header className="mb-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-white">XeTai365</div>
              <p className="truncate text-xs text-slate-300 md:text-sm">Bảng quản trị nội dung</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-300 md:flex">
            <span>{`${formatVNTime(now)} • ${formatVNDate(now)}`}</span>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-4 md:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-2 rounded-full border-slate-300 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Admin Dashboard
            </Badge>
            <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
            <div className="mt-2 text-xs text-slate-400 md:hidden">{`${formatVNTime(now)} • ${formatVNDate(now)}`}</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-white border border-black text-black hover:bg-white hover:text-red-500 hover:border-red-500 px-4 py-2 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
