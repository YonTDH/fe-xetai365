import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, MessageCircleMore, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { NavMenu } from '@/components/NavMenu';
import { Footer } from '@/components/Footer';
import { getPublicSiteSetting, type PublicSiteSetting } from '@/api/landingApi';

function normalizePhoneForZalo(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('0')) {
    return `84${digits.slice(1)}`;
  }

  return digits;
}

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [siteSetting, setSiteSetting] = useState<PublicSiteSetting | null>(null);
  const zaloPhone = normalizePhoneForZalo(siteSetting?.hotline || siteSetting?.dienthoai || '');
  const zaloHref = siteSetting?.zalo?.trim() || (zaloPhone ? `https://zalo.me/${zaloPhone}` : '');

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSiteSetting = async () => {
      try {
        const data = await getPublicSiteSetting();
        if (mounted) {
          setSiteSetting(data);
        }
      } catch {
        if (mounted) {
          setSiteSetting(null);
        }
      }
    };

    void loadSiteSetting();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white font-sans antialiased selection:bg-primary/20 selection:text-primary dark:bg-zinc-950">
      <div className="relative z-40 bg-navy-950">
        <Header setting={siteSetting} />
      </div>

      <div className="sticky top-0 z-50 border-b border-slate-300 bg-white/95 backdrop-blur-sm transition-all">
        <div className="hidden border-b border-slate-700 bg-navy-900 shadow-card lg:block">
          <div className="container mx-auto px-4 py-1.5">
            <div className="flex justify-center rounded-lg bg-transparent px-2">
              <NavMenu layout="topbar" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2.5 lg:hidden">
            <span className="text-sm font-bold uppercase tracking-wide text-slate-700">Menu</span>
            <button
              id="hamburger-menu-btn"
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-300"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={[
          'fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden',
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden={!drawerOpen}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />

        <div
          className={[
            'absolute bottom-0 left-0 top-0 flex w-72 flex-col bg-slate-900 shadow-2xl',
            'transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <span className="text-sm font-bold uppercase tracking-wide text-slate-100">Danh mục</span>
            <button
              aria-label="Đóng menu"
              onClick={() => setDrawerOpen(false)}
              className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <NavMenu layout="sidebar" onItemClick={() => setDrawerOpen(false)} />
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      {zaloHref ? (
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0068ff] text-white shadow-[0_14px_30px_rgba(0,104,255,0.35)] transition-transform hover:scale-105"
        >
          <MessageCircleMore className="h-7 w-7" />
        </a>
      ) : null}

      <Footer setting={siteSetting} />
    </div>
  );
}
