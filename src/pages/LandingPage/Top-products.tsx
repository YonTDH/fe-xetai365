import topProductImg from '@/assets/lading-page/top-product.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LandingProduct } from '@/api/landingApi';

type FeaturesSectionProps = {
  products: LandingProduct[];
  hotline?: string;
};

export function FeaturesSection({ products, hotline }: FeaturesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeHotline = hotline || '0899.966.254';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex border-b-2 border-[#FFD600] mb-8">
          <div
            className="bg-[#FFD600] text-black font-bold uppercase py-2 md:py-3 px-6 text-sm md:text-lg relative"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)',
              paddingRight: '36px',
              marginBottom: '-2px'
            }}
          >
            San pham noi bat
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-[40%] -translate-y-1/2 z-10 bg-white/70 hover:bg-white backdrop-blur-sm shadow-md rounded-full p-2 border border-gray-200 transition-all active:scale-95 opacity-0 group-hover:opacity-100 hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/chi-tiet/${product.slug}`}
                className="w-[85%] md:w-[calc(40%-16px)] lg:w-[calc(28.57%-18px)] shrink-0 snap-start border border-gray-200 bg-white flex flex-col hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square relative overflow-hidden shrink-0 cursor-pointer">
                  <img
                    src={product.imageUrl || topProductImg}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <div className="bg-[#EAEAEA] p-3 md:p-4 flex-1">
                    <h3 className="text-sm font-bold text-gray-800 leading-snug">
                      {product.title}
                    </h3>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 md:p-4 border-t border-white">
                    <p className="text-sm font-semibold text-gray-700">
                      <span className="font-normal text-gray-600">Lien he:</span> {safeHotline}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-[40%] -translate-y-1/2 z-10 bg-white/70 hover:bg-white backdrop-blur-sm shadow-md rounded-full p-2 border border-gray-200 transition-all active:scale-95 flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
}
