import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Monitor, Smartphone, ShieldCheck, Zap } from "lucide-react"

export function Features() {
  const features = [
    {
      title: "Theo dõi Thời gian thực",
      description: "Hàng hóa của bạn luôn trong tầm mắt với công nghệ GPS 24/7.",
      icon: Monitor,
    },
    {
      title: "Ứng dụng Di động",
      description: "Đặt xe và quản lý hành trình dễ dàng ngay trên smartphone của bạn.",
      icon: Smartphone,
    },
    {
      title: "An toàn Tuyệt đối",
      description: "Chính sách bảo hiểm hàng hóa lên đến 100% giá trị hợp đồng.",
      icon: ShieldCheck,
    },
    {
      title: "Xử lý Siêu tốc",
      description: "Đội ngũ điều hành chuyên nghiệp, phản hồi yêu cầu chỉ sau 5 phút.",
      icon: Zap,
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Giải pháp vận tải hàng đầu
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Chúng tôi không chỉ vận chuyển hàng hóa, chúng tôi vận chuyển niềm tin 
            bằng việc tối ưu nhất quy trình logistics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group transition-all hover:shadow-xl hover:border-primary/50 cursor-pointer overflow-hidden">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-1 bg-primary/5 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-primary transition-all duration-500 group-hover:w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
