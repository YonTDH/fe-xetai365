import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import bannerImg from '@/assets/lading-page/red-and-white-modern-car-for-sale-facebook-ad-1_40870.png';
import type { LandingNewsItem } from '@/api/landingApi';

type HeroSectionProps = {
  latestNews: LandingNewsItem[];
};

export function HeroSection({ latestNews }: HeroSectionProps) {
  return (
    <section className="py-8 md:py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="relative flex flex-col lg:block w-full">
          <div className="w-full lg:w-[calc(100%-344px)] xl:w-[calc(100%-412px)] rounded-sm overflow-hidden relative shadow-md group">
            <img
              src={bannerImg}
              alt="Xe Tai 365 Banner"
              className="w-full h-auto object-cover block"
            />
          </div>

          <div className="w-full mt-6 lg:mt-0 lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:w-[320px] xl:w-[380px] bg-white shadow-card rounded-sm overflow-hidden flex flex-col max-h-[380px] lg:max-h-none">
            <div className="flex relative shrink-0">
              <div
                className="bg-primary-600 text-white font-black px-8 py-3 pr-12 relative z-10"
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}
              >
                <span className="text-sm xl:text-base">TIN TUC MOI</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-b-2 border-slate-100"></div>
            </div>

            <div className="flex flex-col p-4 gap-4 flex-1 overflow-y-auto">
              {latestNews.map((item) => (
                <div key={item.id} className="group relative flex gap-4 pb-4 border-b border-dashed border-slate-300 last:border-0 last:pb-0 shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-24 shrink-0 overflow-hidden rounded-[2px] bg-slate-100 border border-slate-100 relative cursor-pointer">
                    <img src={item.imageUrl || bannerImg} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-navy-950 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      <Link to={`/tin-tuc/${item.slug}.html`}>{item.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-2">
                      {item.excerpt || 'Dang cap nhat noi dung...'}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <Link to={`/tin-tuc/${item.slug}.html`} className="text-[10px] text-accent-sky font-medium inline-flex items-center gap-0.5 group-hover:underline">
                        Chi tiet <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {latestNews.length === 0 && (
                <p className="text-sm text-slate-500">Chua co tin tuc moi.</p>
              )}
            </div>

            <div className="p-4 pt-0 shrink-0">
              <Link to="/tin-tuc" className="block w-full py-2.5 text-center text-sm font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
                Xem tat ca tin tuc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
