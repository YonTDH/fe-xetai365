import logoImg from "@/assets/logo-namviet-binh-phuov.png"

export function Header() {
  return (
    <div className="container mx-auto px-4 h-20 flex items-center justify-between">
      {/* Trái: Logo */}
      <div className="flex items-center shrink-0">
        <img src={logoImg} alt="Nam Việt Logo" className="h-16 w-auto object-contain" />
      </div>

      {/* Giữa: Các dòng xe */}
      <div className="hidden md:block flex-1 text-center px-4">
        <h1 className="text-base md:text-lg lg:text-2xl font-black tracking-wider">
          HINO - ISUZU - HUYNDAI - TERACO - JAC
        </h1>
      </div>

      {/* Phải: Liên hệ */}
      <div className="flex flex-col items-end shrink-0">
        <span className="font-bold text-base md:text-lg">Liên hệ: 0899966254</span>
        <span className="font-semibold text-sm">Đức xe tải</span>
      </div>
    </div>
  )
}
