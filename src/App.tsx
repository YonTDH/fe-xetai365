import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans antialiased overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <Features />
        {/* Additional CTA Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="space-y-4 max-w-xl text-center md:text-left z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Sẵn sàng vận chuyển hàng hóa của bạn?</h2>
              <p className="text-primary-foreground/80">Tham gia cùng hàng ngàn khách hàng đã tin tưởng XeTải365 cho mọi chuyến hàng của họ.</p>
            </div>
            <div className="flex gap-4 z-10 shrink-0">
              <button className="h-14 px-10 bg-white text-primary font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 shadow-xl">
                Tư vấn miễn phí
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
