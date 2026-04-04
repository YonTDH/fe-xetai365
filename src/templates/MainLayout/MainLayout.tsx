import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { NavMenu } from '@/components/NavMenu';
import { Footer } from '@/components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white text-black shadow-sm">
        <Header />
        <div className="hidden md:block container mx-auto px-4 pb-2 border-t border-gray-200 pt-2">
          <div className="-ml-[70px]">
            <NavMenu layout="topbar" />
          </div>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
