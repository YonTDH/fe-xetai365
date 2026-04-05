import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { NavMenu } from '@/components/NavMenu';
import { Footer } from '@/components/Footer';

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Khoá scroll body khi drawer mở
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Đóng drawer khi resize lên desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans antialiased selection:bg-primary/20 selection:text-primary relative">
      {/* Top Header — scrolls naturally */}
      <div className="bg-white text-black z-40 relative">
        <Header />
      </div>

      {/* Sticky NavBar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all">
        <div className="container mx-auto px-4">
          {/* Desktop topbar nav */}
          <div className="hidden lg:block py-2">
            <div className="-ml-[70px]">
              <NavMenu layout="topbar" />
            </div>
          </div>

          {/* Mobile nav bar — hamburger only */}
          <div className="flex lg:hidden items-center justify-between py-2.5">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Menu
            </span>
            <button
              id="hamburger-menu-btn"
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={[
          'fixed inset-0 z-60 lg:hidden transition-opacity duration-300',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={[
            'absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col',
            'transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-sm text-gray-800 uppercase tracking-wide">
              Danh mục
            </span>
            <button
              aria-label="Đóng menu"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-3">
            <NavMenu
              layout="sidebar"
              onItemClick={() => setDrawerOpen(false)}
            />
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
