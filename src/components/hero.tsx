import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Clock, CheckCircle2 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl rounded-full" />
      <div className="absolute top-1/4 -right-1/4 -z-10 w-[500px] h-[500px] bg-primary/10 blur-3xl rounded-full opacity-50 animate-pulse" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold tracking-wider uppercase animate-fade-in">
            🚀 Công nghệ vận tải 4.0
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Vận tải thông minh, <span className="text-primary italic">Hành trình tin cậy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:zinc-400 max-w-2xl">
            XeTải365 cung cấp giải pháp đặt xe vận chuyển hàng hóa nhanh chóng, 
            minh bạch và chuyên nghiệp hàng đầu Việt Nam. Kết nối bạn với hàng ngàn bác tài tin cậy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg group">
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              Xem bảng giá
            </Button>
          </div>
          
          <div className="pt-8 flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-sm">4.9/5 Đánh giá</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-500" />
              <span className="font-semibold text-sm">Phục vụ 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-sm">Bảo hiểm 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
