import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="premium-blur-bg" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 space-y-12 max-w-lg">
        <div className="flex flex-col items-center gap-8">
          <div className="relative group animate-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-purple-600 to-pink-500 rounded-[40px] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative glass-card p-6 rounded-[32px] border-white/20 shadow-2xl">
              <Image 
                src="/logo.png" 
                alt="QR Party Logo" 
                width={160} 
                height={160} 
                className="rounded-2xl"
                priority
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Next Gen Party Experience
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
              QR <span className="bg-clip-text text-transparent bg-vibrant-gradient text-glow">PARTY</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium tracking-tight">
              실시간으로 소통하고 즐기는 <br className="md:hidden" />
              <span className="text-white">스마트 파티의 시작</span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <Link href="/setup">
              <Button size="lg" className="w-full h-16 text-xl font-black rounded-2xl bg-vibrant-gradient hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] border-t border-white/20">
                파티 참여하기
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-white/40 tracking-wide flex items-center gap-2">
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              별도의 회원가입 없이 익명으로 참여 가능합니다.
              <span className="w-1 h-1 bg-white/20 rounded-full" />
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          Powered by QR Party Engine
        </p>
      </div>
    </div>
  )
}
