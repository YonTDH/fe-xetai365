import { Truck, Globe, Send, Camera, Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-primary p-1.5 rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">XeTại365</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Mạng lưới vận tải hàng hóa chuyên nghiệp 24/7, đồng hành cùng sự phát triển của doanh nghiệp bạn mọi lúc mọi nơi.
            </p>
            <div className="flex gap-4 pt-4">
              <Globe className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Send className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Camera className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Briefcase className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Dịch vụ</h4>
            <ul className="space-y-4 text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">Vận chuyển nội thành</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Vận chuyển liên tỉnh</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Vận tải container</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Dịch vụ kho bãi</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Công ty</h4>
            <ul className="space-y-4 text-sm">
              <li className="hover:text-primary cursor-pointer transition-colors">Về chúng tôi</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Tuyển dụng tài xế</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Tin tức vận tải</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Đối tác liên kết</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors italic">
                Hotline: 1900 8888
              </li>
              <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                Email: support@xetai365.com
              </li>
              <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                Địa chỉ: Quận Cầu Giấy, Hà Nội
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© 2026 XeTải365. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Điều khoản dịch vụ</span>
            <span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</span>
            <span className="hover:text-white cursor-pointer transition-colors">Quy trình xử lý hàng hóa</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
