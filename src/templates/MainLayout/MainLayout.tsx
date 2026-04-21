import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { NavMenu } from '@/components/NavMenu';
import { Footer } from '@/components/Footer';

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-white font-sans antialiased selection:bg-primary/20 selection:text-primary dark:bg-zinc-950">
      <div className="relative z-40 bg-navy-950">
        <Header />
      </div>

      <div className="sticky top-0 z-50 border-b border-slate-300 bg-white/95 backdrop-blur-sm transition-all">
        <div className="hidden border-b border-slate-700 bg-navy-900 shadow-card lg:block">
          <div className="container mx-auto px-4 py-1.5">
            <div className="rounded-lg bg-transparent px-2">
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

      <Footer />
    </div>
  );
}
