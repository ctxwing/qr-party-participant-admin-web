import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-12 max-w-md animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Image 
              src="/logo.png" 
              alt="QR Party Logo" 
              width={180} 
              height={180} 
              className="relative rounded-3xl shadow-2xl"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-foreground">
              QR <span className="text-primary">PARTY</span>
            </h1>
            <p className="text-muted-foreground font-medium">실시간으로 소통하고 즐기는 스마트 파티</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/setup">
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              파티 참여하기
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">별도의 회원가입 없이 익명으로 참여 가능합니다.</p>
        </div>
      </div>
    </div>
  )
}
