import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">XeTại365</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">Dịch vụ</a>
          <a href="#" className="hover:text-primary transition-colors">Bảng giá</a>
          <a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a>
          <a href="#" className="hover:text-primary transition-colors">Liên hệ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Đăng nhập</Button>
          <Button>Đặt xe ngay</Button>
        </div>
      </div>
    </header>
  )
}
