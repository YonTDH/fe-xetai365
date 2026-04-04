import { ChevronRight } from 'lucide-react';
import bannerImg from '@/assets/lading-page/red-and-white-modern-car-for-sale-facebook-ad-1_40870.png';

export function HeroSection() {
  const newsItems = [
    {
      id: 1,
      title: "TERA 350SL SIÊU HOT 2025",
      desc: "Tìm hiểu chi tiết Teraco 350SL 2025 thùng bạt: động cơ, tải trọng, ưu nhược điểm, giá...",
      imageUrl: "https://placehold.co/150x100/1D4ED8/FFFFFF?text=TERA+350SL",
    },
    {
      id: 2,
      title: "Xe tải TERA V8 – Lựa chọn hoàn hảo cho chở hàng nhẹ trong phố",
      desc: "Xe tải TERA V8 – Lựa chọn hoàn hảo cho chở hàng nhẹ trong phố, linh hoạt mọi cung đường.",
      imageUrl: "https://placehold.co/150x100/DC2626/FFFFFF?text=TERA+V8",
    },
    {
      id: 3,
      title: "Top 5 lý do bạn nên mua xe tải Tera345sl",
      desc: "Xe tải Tera 345SL – Dòng xe 3 tấn 5 thùng dài bán chạy nhất hiện nay trên thị trường.",
      imageUrl: "https://placehold.co/150x100/0EA5E9/FFFFFF?text=TERA+345SL",
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Relative wrapper. On desktop, banner defines height, news is absolute tracking top/bottom */}
        <div className="relative flex flex-col lg:block w-full">
          
          {/* Main Banner - Left Side (Normal flow, dictates height) */}
          <div className="w-full lg:w-[calc(100%-344px)] xl:w-[calc(100%-412px)] rounded-sm overflow-hidden relative shadow-md group">
            <img
              src={bannerImg}
              alt="Xe Tải 365 Banner"
              className="w-full h-auto object-cover block"
            />
          </div>

          {/* Sidebar - News - Right Side */}
          <div className="w-full mt-6 lg:mt-0 lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:w-[320px] xl:w-[380px] bg-white shadow-card rounded-sm overflow-hidden flex flex-col">
            {/* Header with angled design */}
            <div className="flex relative shrink-0">
              <div
                className="bg-primary-600 text-white font-black px-8 py-3 pr-12 relative z-10"
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}
              >
                <span className="text-sm xl:text-base">TIN TỨC MỚI</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 border-b-2 border-slate-100"></div>
            </div>

            {/* News List */}
            <div className="flex flex-col p-4 gap-4 flex-1 overflow-y-auto">
              {newsItems.map((item) => (
                <div key={item.id} className="group relative flex gap-4 pb-4 border-b border-dashed border-slate-300 last:border-0 last:pb-0 shrink-0">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-24 shrink-0 overflow-hidden rounded-[2px] bg-slate-100 border border-slate-100 relative cursor-pointer">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-navy-950 text-sm leading-snug mb-1.5 line-clamp-2 cursor-pointer group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-2">
                      {item.desc}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <span className="text-[10px] text-accent-sky font-medium inline-flex items-center gap-0.5 group-hover:underline cursor-pointer">
                        Chi tiết <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="p-4 pt-0 shrink-0">
              <button className="w-full py-2.5 text-center text-sm font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
                Xem tất cả bảng giá & tin tức
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
