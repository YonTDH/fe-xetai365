import topProductImg from "@/assets/lading-page/top-product.png";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

const CATEGORIES = [
  { id: "xe-dau-keo", label: "XE ĐẦU KÉO" },
  { id: "xe-tai", label: "XE TẢI" },
  { id: "xe-chuyen-dung", label: "XE CHUYÊN DỤNG" },
  { id: "somiromoc", label: "SƠMI RƠMOOC" },
];

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  "xe-dau-keo": ["SHACMAN", "HOWO", "DONGFENG", "FAW", "CHENGLONG"],
  "xe-tai": ["TERACO", "DONGFENG", "XE CŨ", "MAN", "CHENGLONG"],
  "xe-chuyen-dung": ["HINO", "ISUZU", "MITSUBISHI", "THACO", "VEAM"],
  "somiromoc": ["CIMC", "DOOSUNG", "FONTON", "XUÂN KIÊN", "VIỆT SÉCT"],
};

const PRODUCT_NAME =
  "XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 9.TẤN MỚI NHẤT";
const PRODUCT_CONTACT = "LIÊN HỆ: 0899.966.254";

export function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const brands = BRANDS_BY_CATEGORY[activeCategory] ?? [];

  const products = Array(8).fill({
    image: topProductImg,
    name: PRODUCT_NAME,
    contact: PRODUCT_CONTACT,
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setActiveBrand(null);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* ─── Header Row ─────────────────────────────────────────────── */}
        <div className="flex flex-col border-b-2 border-[#FFD600] mb-8">
          {/* Category tabs */}
          <div className="flex items-end gap-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={[
                    "relative font-bold uppercase py-1.5 md:py-3 px-3 md:px-5 text-xs md:text-base transition-all duration-200 select-none outline-none whitespace-nowrap",
                    "focus-visible:ring-2 focus-visible:ring-[#FFD600]",
                    isActive
                      ? "bg-[#FFD600] text-black z-10"
                      : "bg-white text-gray-500 hover:text-black hover:bg-[#FFF8CC]",
                  ].join(" ")}
                  style={
                    isActive
                      ? {
                        clipPath:
                          "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
                        paddingRight: "28px",
                        marginBottom: "-2px",
                      }
                      : undefined
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Brand sub-tabs — horizontally scrollable on mobile */}
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2">
            <div className="flex items-center gap-4 md:gap-8 min-w-max">
              {brands.map((brand) => {
                const isActive = activeBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() =>
                      setActiveBrand((prev) => (prev === brand ? null : brand))
                    }
                    className={[
                      "text-xs md:text-base font-semibold uppercase transition-colors duration-150 outline-none whitespace-nowrap",
                      isActive
                        ? "text-[#c8a800] underline underline-offset-4"
                        : "text-gray-600 hover:text-black",
                    ].join(" ")}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Product List ───*/}
        <div className="relative group">
          {/* Scroll Left */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-[40%] -translate-y-1/2 z-10 bg-white/70 hover:bg-white backdrop-blur-sm shadow-md rounded-full p-2 border border-gray-200 transition-all active:scale-95 opacity-0 group-hover:opacity-100 hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product, index) => (
              <div
                key={index}
                className="w-[85%] md:w-[calc(40%-16px)] lg:w-[calc(28.57%-18px)] shrink-0 snap-start border border-gray-200 bg-white flex flex-col hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden shrink-0 cursor-pointer">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <div className="bg-[#EAEAEA] p-3 md:p-4 flex-1">
                    <h3 className="text-sm font-bold text-gray-800 leading-snug cursor-pointer hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 md:p-4 border-t border-white">
                    <p className="text-sm font-semibold text-gray-700">
                      {product.contact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right */}
          <button
            onClick={() => scroll("right")}
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
