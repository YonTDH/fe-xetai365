import topProductImg from '@/assets/lading-page/top-product.png';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LandingProduct } from '@/api/landingApi';
import { formatPhoneDisplay } from '@/lib/formatPhone';

type FeaturesSectionProps = {
  products: LandingProduct[];
  hotline?: string;
};

export function FeaturesSection({ products, hotline }: FeaturesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeHotline = hotline ? formatPhoneDisplay(hotline) : 'Đang cập nhật';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <PublicSectionHeading title="Sản phẩm nổi bật" />

        <div className="group relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-[40%] z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/70 p-2 shadow-md backdrop-blur-sm transition-all active:scale-95 group-hover:opacity-100 md:flex md:opacity-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/chi-tiet/${product.slug}`}
                className="flex w-[85%] shrink-0 snap-start flex-col border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl md:w-[calc(40%-16px)] lg:w-[calc(28.57%-18px)]"
              >
                <div className="relative aspect-square shrink-0 overflow-hidden">
                  <img
                    src={product.imageUrl || topProductImg}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex-1 bg-[#EAEAEA] p-3 md:p-4">
                    <h3 className="text-sm font-bold leading-snug text-gray-800">{product.title}</h3>
                  </div>
                  <div className="border-t border-white bg-[#F5F5F5] p-3 md:p-4">
                    <p className="text-sm font-semibold text-gray-700">
                      <span className="font-normal text-gray-600">Liên hệ:</span> {safeHotline}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-[40%] z-10 flex -translate-y-1/2 rounded-full border border-gray-200 bg-white/70 p-2 shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
}
