import topProductImg from '@/assets/lading-page/top-product.png';
import { PublicSectionHeading } from '@/components/PublicSectionHeading';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const safeHotline = hotline || 'Đang cập nhật';

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
    [rootCategories, activeCategory],
  );

  const level2Categories = useMemo(
    () => (activeRootCategory?.children || []).filter((item) => item.id > 0 && item.slug && !isSummaryCategorySlug(item.slug)),
    [activeRootCategory],
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
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <PublicSectionHeading title="Sản phẩm theo danh mục" className="mb-5" />

        <div className="mb-8 border-b-2 border-navy-950/20 pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-end gap-2">
                {rootCategories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={[
                        'rounded-md border px-3 py-2 text-[11px] font-bold uppercase whitespace-nowrap transition-all duration-200 outline-none md:px-4 md:text-sm',
                        'focus-visible:ring-2 focus-visible:ring-navy-950',
                        isActive
                          ? 'border-navy-950 bg-navy-950 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-navy-950/30 hover:bg-slate-50 hover:text-navy-950',
                      ].join(' ')}
                    >
                      {getCategoryDisplayName(cat.slug, cat.name)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto lg:max-w-[58%]">
              <div className="flex min-w-max items-center gap-4 md:gap-6 lg:justify-end">
                <button
                  onClick={() => setActiveLevel2Category('')}
                  className={[
                    'text-[11px] font-semibold uppercase whitespace-nowrap transition-colors duration-150 outline-none md:text-sm',
                    activeLevel2Category.length === 0
                      ? 'text-navy-950 underline underline-offset-4'
                      : 'text-gray-600 hover:text-navy-950',
                  ].join(' ')}
                >
                  Tất cả
                </button>
                {level2Categories.map((level2) => {
                  const isActive = activeLevel2Category === level2.slug;
                  return (
                    <button
                      key={level2.id}
                      onClick={() => setActiveLevel2Category(level2.slug)}
                      className={[
                        'text-[11px] font-semibold uppercase whitespace-nowrap transition-colors duration-150 outline-none md:text-sm',
                        isActive ? 'text-navy-950 underline underline-offset-4' : 'text-gray-600 hover:text-navy-950',
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

        <div className="group relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-[40%] z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/70 p-2 shadow-md backdrop-blur-sm transition-all active:scale-95 group-hover:opacity-100 md:flex md:opacity-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>

          <div ref={scrollRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 scroll-smooth md:gap-6">
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
                    <p className="text-sm font-semibold text-gray-700">Liên hệ: {safeHotline}</p>
                  </div>
                </div>
              </Link>
            ))}

            {!isLoading && products.length === 0 && (
              <p className="text-sm text-slate-500">Không có sản phẩm trong danh mục này.</p>
            )}
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
