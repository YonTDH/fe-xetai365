import {
  Home,
  Phone,
  Mail,
  Globe,
  Users,
  BarChart2,
  Calendar,
  Hash,
  MessageCircle,
} from "lucide-react";

export function Footer() {
  return (
    <footer>
      {/* ── Top contact bar ─────────────────────────────────────────── */}
      <div className="bg-[#0f172a] text-gray-300 text-sm md:text-base py-3 border-b border-slate-700">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12">
          <span className="flex items-center gap-2 font-semibold tracking-wide">
            ĐIỆN THOẠI:&nbsp;
            <a href="tel:0899966254" className="hover:text-blue-400 transition-colors">
              0899.966.254
            </a>
          </span>
          <span className="flex items-center gap-2 font-semibold tracking-wide">
            EMAIL:&nbsp;
            <a href="mailto:vanducbon99@gmail.com" className="hover:text-blue-400 transition-colors">
              vanducbon99@gmail.com
            </a>
          </span>
        </div>
      </div>

      {/* ── Main dark body ────────────────────────────────────────── */}
      <div className="bg-[#0f172a] text-gray-300 py-10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Left – Company info */}
          <div>
            <h3 className="text-lg font-extrabold mb-5 uppercase tracking-wide text-white">
              Ô TÔ NAM VIỆT GROUP
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Home className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Showroom 1:</span> 312, Võ Chí Công, Phường Phú Hữu, Quận 9, TP. Hồ Chí Minh.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Home className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Showroom 2:</span> Số 18, Cầu Phú long, KP. Hòa Long, TP. Thuận An, T. Bình Dương.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Home className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="font-semibold">Showroom 3:</span> 48 Ngô Quyền, Phường Hiệp Phú, TP Thủ Đức, TP Hồ Chí Minh.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:0899966254" className="hover:underline">0899.966.254</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:vanducbon99@gmail.com" className="hover:underline">
                  vanducbon99@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 shrink-0" />
                <span>
                  <a href="http://xetai365.vn" className="hover:underline">http://xetai365.vn</a>
                  {" "}hoặc{" "}
                  <a href="http://otonamvietgroup.com" className="hover:underline">http://otonamvietgroup.com</a>
                </span>
              </li>
            </ul>
          </div>

          {/* Right – Traffic stats + social + BCT logo */}
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div>
              <h3 className="text-base font-extrabold mb-4 uppercase tracking-wide text-blue-400">
                THỐNG KÊ TRUY CẬP
              </h3>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Đang online: <span className="font-bold ml-1">3</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  Thống kê tuần: <span className="font-bold ml-1">1191</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Thống kê tháng: <span className="font-bold ml-1">847</span>
                </li>
                <li className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-400" />
                  Tổng: <span className="font-bold ml-1">414227</span>
                </li>
              </ul>
            </div>

            {/* Social icons + BCT logo */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Social */}
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded flex items-center justify-center bg-[#1877F2] hover:opacity-80 transition-opacity text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* Youtube */}
                <a
                  href="#"
                  aria-label="Youtube"
                  className="w-9 h-9 rounded flex items-center justify-center bg-[#FF0000] hover:opacity-80 transition-opacity text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Zalo"
                  className="w-9 h-9 rounded flex items-center justify-center bg-[#0068FF] hover:opacity-80 transition-opacity text-white text-[10px] font-extrabold"
                >
                  Zalo
                </a>
                <a
                  href="#"
                  aria-label="Skype"
                  className="w-9 h-9 rounded flex items-center justify-center bg-[#00AFF0] hover:opacity-80 transition-opacity text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>

              {/* BCT logo */}
              <a
                href="http://online.gov.vn"
                target="_blank"
                rel="noopener noreferrer"
                title="Đã đăng ký Bộ Công Thương"
              >
                <img
                // src={logoBCT}
                // alt="Đã đăng ký Bộ Công Thương"
                // className="h-14 object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ────────────────────────────────────── */}
      <div className="bg-[#222] text-gray-400 text-xs py-4 text-center">
        Copyright © 2017 Ô TÔ NAM VIỆT GROUP | All rights reserved.
      </div>
    </footer>
  );
}
