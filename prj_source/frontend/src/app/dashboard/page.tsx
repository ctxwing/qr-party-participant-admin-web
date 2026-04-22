'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { MessageCircle, Heart, Zap, Award, AlertTriangle } from 'lucide-react'
import { checkRateLimit } from '@/lib/rateLimit'
import Link from 'next/link'

// Mock Data (T013에서 실제 API 연동 예정)
const mockParticipants = [
  { id: '1', nickname: '상큼체리', status: 'ONLINE' },
  { id: '2', nickname: '젠틀맨', status: 'ONLINE' },
  { id: '3', nickname: '춤추는곰', status: 'AWAY' },
  { id: '4', nickname: '미소천사', status: 'ONLINE' },
]

export default function DashboardPage() {
  const { participant } = useStore()
  useRealtime(participant?.id)
  
  const [selectedUser, setSelectedUser] = useState<{id: string, nickname: string} | null>(null)
  const [message, setMessage] = useState('')

  const triggerHaptic = () => {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_VIBRATION !== 'OFF'
    if (isEnabled && typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10)
    }
  }

  const handleInteraction = (type: 'CUPID' | 'LIKE') => {
    triggerHaptic()
    if (!participant?.id) return
    const { allowed, remaining } = checkRateLimit(participant.id)
    
    if (!allowed) {
      toast.error(`${remaining}초 후에 다시 시도해주세요.`)
      return
    }

    toast.success(`${selectedUser?.nickname}님에게 ${type === 'CUPID' ? '큐피트' : '호감도'}를 보냈습니다!`)
    setSelectedUser(null)
  }

  const handleSendMessage = () => {
    if (!message.trim() || !participant?.id) return
    const { allowed, remaining } = checkRateLimit(participant.id)
    
    if (!allowed) {
      toast.error(`${remaining}초 후에 다시 시도해주세요.`)
      return
    }

    toast.success(`${selectedUser?.nickname}님에게 쪽지를 보냈습니다.`)
    setMessage('')
    setSelectedUser(null)
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header Section */}
      <div className="w-full max-w-md mx-auto space-y-6 pt-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">파티 현황</h1>
            <p className="text-muted-foreground">{participant?.nickname || '참여자'}님, 환영합니다!</p>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary animate-pulse">
            LIVE 42
          </div>
        </div>
        
        {/* Stat Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass border-none text-center p-2">
            <p className="text-xl">📩</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Message</p>
            <p className="text-lg font-bold">2</p>
          </Card>
          <Card className="glass border-none text-center p-2">
            <p className="text-xl">💘</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Cupid</p>
            <p className="text-lg font-bold">1</p>
          </Card>
          <Card className="glass border-none text-center p-2">
            <p className="text-xl">⭐</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Likes</p>
            <p className="text-lg font-bold">12</p>
          </Card>
        </div>

        {/* Participant List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            참여 중인 사람들
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {mockParticipants.map((p) => (
              <Dialog key={p.id}>
                <DialogTrigger 
                  render={
                    <Card 
                      className="glass border-none hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                      onClick={() => setSelectedUser(p)}
                    />
                  }
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {p.nickname[0]}
                    </div>
                    <p className="font-bold text-sm truncate w-full text-center">{p.nickname}</p>
                  </CardContent>
                </DialogTrigger>
                <DialogContent className="glass border-none max-w-[90%] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                      {p.nickname}님에게
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2 glass border-none hover:bg-cupid/20"
                      onClick={() => handleInteraction('CUPID')}
                    >
                      <Zap className="w-8 h-8 text-cupid" />
                      <span className="text-xs font-bold">큐피트 발사</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2 glass border-none hover:bg-like/20"
                      onClick={() => handleInteraction('LIKE')}
                    >
                      <Heart className="w-8 h-8 text-like" />
                      <span className="text-xs font-bold">호감도 주기</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground px-1">익명 쪽지 보내기</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="쪽지 내용을 입력하세요..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="glass border-none"
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>

      {/* Global Floating Actions */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6 pointer-events-none">
        <Button 
          size="lg" 
          className="rounded-full shadow-2xl bg-sos hover:bg-sos/90 pointer-events-auto h-14 px-6 gap-2"
          onClick={() => {
            triggerHaptic()
            toast.error('관리자에게 SOS 요청을 보냈습니다!')
          }}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">SOS</span>
        </Button>
        <Link href="/ranking" className="pointer-events-auto">
          <Button 
            size="lg" 
            className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 h-14 px-6 gap-2"
            onClick={triggerHaptic}
          >
            <Award className="w-5 h-5" />
            <span className="font-bold">RANKING</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
