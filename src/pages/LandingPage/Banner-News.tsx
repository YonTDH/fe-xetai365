import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import bannerImg from '@/assets/lading-page/red-and-white-modern-car-for-sale-facebook-ad-1_40870.png';
import type { HomeSlide, LandingNewsItem } from '@/api/landingApi';

type HeroSectionProps = {
  latestNews: LandingNewsItem[];
  slides: HomeSlide[];
};

function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  return `/${trimmed.replace(/^\/+/, '')}`;
}

export function HeroSection({ latestNews, slides }: HeroSectionProps) {
  const visibleSlides = useMemo(() => slides.filter((slide) => slide.imageUrl.trim()), [slides]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [renderedSlideIndex, setRenderedSlideIndex] = useState(0);
  const [isSlideVisible, setIsSlideVisible] = useState(true);
  const renderedSlide = visibleSlides.length ? visibleSlides[renderedSlideIndex % visibleSlides.length] : null;
  const renderedSlideLink = normalizeLink(renderedSlide?.linkUrl || '');

  useEffect(() => {
    setActiveSlideIndex(0);
    setRenderedSlideIndex(0);
    setIsSlideVisible(true);
  }, [visibleSlides.length]);

  useEffect(() => {
    if (!visibleSlides.length) {
      setRenderedSlideIndex(0);
      setIsSlideVisible(true);
      return undefined;
    }

    if (activeSlideIndex === renderedSlideIndex) {
      setIsSlideVisible(true);
      return undefined;
    }

    setIsSlideVisible(false);
    const timeoutId = window.setTimeout(() => {
      setRenderedSlideIndex(activeSlideIndex);
      window.requestAnimationFrame(() => setIsSlideVisible(true));
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [activeSlideIndex, renderedSlideIndex, visibleSlides.length]);

  useEffect(() => {
    if (visibleSlides.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % visibleSlides.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [visibleSlides.length]);

  const slideImage = renderedSlide ? (
    <img
      src={renderedSlide.imageUrl}
      alt={renderedSlide.title || 'Slide ảnh'}
      className={[
        'block h-full w-full object-cover transition-all duration-500 ease-out',
        isSlideVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-4 scale-[1.015] opacity-0',
      ].join(' ')}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-500">
      Chưa có slide hiển thị
    </div>
  );

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="relative flex w-full flex-col lg:block">
          <div className="group relative h-[210px] w-full overflow-hidden rounded-sm shadow-md sm:h-[320px] md:h-[420px] lg:h-[430px] lg:w-[calc(100%-344px)] xl:h-[548px] xl:w-[calc(100%-412px)]">
            {renderedSlide && renderedSlideLink ? (
              renderedSlideLink.startsWith('http') ? (
                <a href={renderedSlideLink} target="_blank" rel="noreferrer" className="block h-full w-full">
                  {slideImage}
                </a>
              ) : (
                <Link to={renderedSlideLink} className="block h-full w-full">
                  {slideImage}
                </Link>
              )
            ) : (
              slideImage
            )}

            {visibleSlides.length > 1 ? (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {visibleSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlideIndex(index)}
                    className={[
                      'h-2.5 rounded-full transition-all',
                      index === activeSlideIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/55 hover:bg-white/80',
                    ].join(' ')}
                    aria-label={`Chọn slide ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex max-h-[380px] w-full flex-col overflow-hidden rounded-sm bg-white shadow-card lg:absolute lg:bottom-0 lg:right-0 lg:top-0 lg:mt-0 lg:w-[320px] lg:max-h-none xl:w-[380px]">
            <div className="relative flex shrink-0">
              <div
                className="relative z-10 bg-navy-950 px-8 py-3 pr-12 text-white"
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}
              >
                <span className="font-sans text-[15px] font-bold uppercase tracking-[0.08em] xl:text-[18px]">
                  Tin tức mới
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-b-2 border-slate-100" />
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {latestNews.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex shrink-0 gap-4 border-b border-dashed border-slate-300 pb-4 last:border-0 last:pb-0"
                >
                  <div className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-[2px] border border-slate-100 bg-slate-100 sm:h-24 sm:w-28">
                    <img
                      src={item.imageUrl || bannerImg}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-navy-950 transition-colors group-hover:text-navy-900">
                      <Link to={`/tin-tuc/${item.slug}.html`}>{item.title}</Link>
                    </h3>
                    <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {item.excerpt || 'Đang cập nhật nội dung...'}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <Link
                        to={`/tin-tuc/${item.slug}.html`}
                        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-navy-950 group-hover:underline"
                      >
                        Chi tiết <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {latestNews.length === 0 && <p className="text-sm text-slate-500">Chưa có tin tức mới.</p>}
            </div>

            <div className="shrink-0 p-4 pt-0">
              <Link
                to="/tin-tuc"
                className="block w-full rounded-md bg-slate-100 py-2.5 text-center text-sm font-semibold text-navy-950 transition-colors hover:bg-slate-200"
              >
                Xem tất cả tin tức
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
