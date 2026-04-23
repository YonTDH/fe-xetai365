import topProductImg from '@/assets/lading-page/top-product.png';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCategoryDisplayName,
  isSummaryCategorySlug,
  listProductsByCategory,
  type CategoryNode,
  type LandingProduct,
} from '@/api/landingApi';

type CategoriesSectionProps = {
  categories: CategoryNode[];
  hotline?: string;
};

export function CategoriesSection({ categories, hotline }: CategoriesSectionProps) {
  const rootCategories = useMemo(() => categories.filter((item) => item.id > 0), [categories]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeLevel2Category, setActiveLevel2Category] = useState('');
  const [products, setProducts] = useState<LandingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeHotline = hotline || '0899.966.254';

  useEffect(() => {
    if (rootCategories.length === 0) {
      setActiveCategory('');
      setActiveLevel2Category('');
      setProducts([]);
      return;
    }

    const exists = rootCategories.some((item) => item.slug === activeCategory);
    if (!activeCategory || !exists) {
      setActiveCategory(rootCategories[0].slug);
    }
  }, [rootCategories, activeCategory]);

  const activeRootCategory = useMemo(
    () => rootCategories.find((item) => item.slug === activeCategory) || null,
    [rootCategories, activeCategory]
  );

  const level2Categories = useMemo(
    () => (activeRootCategory?.children || []).filter((item) => item.id > 0 && item.slug && !isSummaryCategorySlug(item.slug)),
    [activeRootCategory]
  );

  useEffect(() => {
    if (level2Categories.length === 0) {
      if (activeLevel2Category) {
        setActiveLevel2Category('');
      }
      return;
    }

    const exists = level2Categories.some((item) => item.slug === activeLevel2Category);
    if (!exists) {
      setActiveLevel2Category('');
    }
  }, [level2Categories, activeLevel2Category]);

  useEffect(() => {
    const targetCategorySlug = activeLevel2Category || activeCategory;

    if (!targetCategorySlug) {
      setProducts([]);
      return;
    }

    let isMounted = true;
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const items = await listProductsByCategory(targetCategorySlug, 20);
        if (!isMounted) return;
        setProducts(items);
      } catch {
        if (!isMounted) return;
        setProducts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeLevel2Category]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setActiveLevel2Category('');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col border-b-2 border-[#FFD600] mb-8">
          <div className="flex flex-col gap-3 pb-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="overflow-x-auto">
              <div className="flex items-end gap-0 min-w-max">
                {rootCategories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={[
                        'relative font-bold uppercase py-1.5 md:py-2.5 px-3 md:px-4 text-[11px] md:text-sm transition-all duration-200 select-none outline-none whitespace-nowrap',
                        'focus-visible:ring-2 focus-visible:ring-[#FFD600]',
                        isActive
                          ? 'bg-[#FFD600] text-black z-10'
                          : 'bg-white text-gray-500 hover:text-black hover:bg-[#FFF8CC]',
                      ].join(' ')}
                      style={
                        isActive
                          ? {
                            clipPath:
                              'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)',
                            paddingRight: '28px',
                            marginBottom: '-2px',
                          }
                          : undefined
                      }
                    >
                      {getCategoryDisplayName(cat.slug, cat.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto lg:max-w-[58%]">
              <div className="flex items-center gap-4 md:gap-6 min-w-max lg:justify-end">
                <button
                  onClick={() => setActiveLevel2Category('')}
                  className={[
                    'text-[11px] md:text-sm font-semibold uppercase transition-colors duration-150 outline-none whitespace-nowrap',
                    activeLevel2Category.length === 0
                      ? 'text-[#c8a800] underline underline-offset-4'
                      : 'text-gray-600 hover:text-black',
                  ].join(' ')}
                >
                  {'T\u1ea4T C\u1ea2'}
                </button>
                {level2Categories.map((level2) => {
                  const isActive = activeLevel2Category === level2.slug;
                  return (
                    <button
                      key={level2.id}
                      onClick={() => setActiveLevel2Category(level2.slug)}
                      className={[
                        'text-[11px] md:text-sm font-semibold uppercase transition-colors duration-150 outline-none whitespace-nowrap',
                        isActive
                          ? 'text-[#c8a800] underline underline-offset-4'
                          : 'text-gray-600 hover:text-black',
                      ].join(' ')}
                    >
                      {getCategoryDisplayName(level2.slug, level2.name)}
                    </button>
                  );
                })}
              </div>
            </div>
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
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scroll-smooth"
          >
            {products.map((product) => (
              <div
                key={product.id}
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
                      {'Li\u00ean h\u1ec7'}: {safeHotline}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && products.length === 0 && (
              <p className="text-sm text-slate-500">{'Kh\u00f4ng c\u00f3 s\u1ea3n ph\u1ea9m trong danh m\u1ee5c n\u00e0y.'}</p>
            )}
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
