import logoImg from "@/assets/logo-namviet-binh-phuov.png"

export function Header() {
  return (
    <div className="container mx-auto px-4 h-20 flex items-center justify-between text-slate-100">
      {/* Left */}
      <div className="flex items-center shrink-0">
        <img src={logoImg} alt="Nam Việt Logo" className="h-16 w-auto object-contain" />
      </div>

      {/* Middle */}
      <div className="hidden md:block flex-1 text-center px-4">
        <h1 className="text-base md:text-lg lg:text-2xl font-black tracking-wide text-white">
          HINO - ISUZU - HUYNDAI - TERACO - JAC
        </h1>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end shrink-0">
        <span className="font-bold text-base md:text-lg text-slate-100">Liên hệ: 0899.966.254</span>
        <span className="font-semibold text-sm text-primary-400">ĐỨC XE TẢI</span>
      </div>
    </div>
  )
}
