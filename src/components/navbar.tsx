import { Button } from "@/components/ui/button"
import { Truck } from "lucide-react"
import { NavMenu } from "@/components/NavMenu"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80 shadow-sm">
      {/* Cụm Logo và Nút bấm ở một dòng trên */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">XeTại365</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">Đăng nhập</Button>
          <Button>Đặt xe ngay</Button>
        </div>
      </div>

      {/* NavMenu */}
      <div className="hidden md:block container mx-auto px-4 pb-2 border-t border-border/40 pt-2">
        <div className="-ml-[70px]">
          <NavMenu layout="topbar" />
        </div>
      </div>
    </header>
  )
}
