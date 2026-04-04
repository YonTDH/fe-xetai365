import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { NavMenu } from '@/components/NavMenu';
import { Footer } from '@/components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans antialiased selection:bg-primary/20 selection:text-primary relative">
      {/* Top Header: scrolls out of view naturally */}
      <div className="bg-white text-black z-40 relative">
        <Header />
      </div>
      
      {/* NavMenu: sticks to the top of screen when scrolling past */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all">
        <div className="hidden md:block container mx-auto px-4 py-2">
          <div className="-ml-[70px]">
            <NavMenu layout="topbar" />
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
