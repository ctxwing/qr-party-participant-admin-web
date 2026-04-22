'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { MessageCircle, Heart, Zap, Award, AlertTriangle } from 'lucide-react'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const { participant } = useStore()
  useRealtime(participant?.id)
  
  const [participants, setParticipants] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<{id: string, nickname: string} | null>(null)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({ messages: 0, cupid: 0, likes: 0 })
  const [myProfile, setMyProfile] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    if (!participant?.id) return
    fetchParticipants()
    fetchMyStats()

    // 실시간 업데이트 구독 (참여자 목록 및 스탯)
    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        fetchParticipants()
        fetchMyStats()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${participant.id}` }, () => {
        fetchMyStats()
        toast('새로운 쪽지가 도착했습니다! 📩')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [participant?.id])

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('participants')
      .select('id, nickname, last_active')
      .order('last_active', { ascending: false })
      .limit(50)
    
    if (data) {
      setParticipants(data.filter(p => p.id !== participant?.id))
    }
  }

  const fetchMyStats = async () => {
    if (!participant?.id) return
    
    // 내가 받은 스탯 (쪽지, 큐피트, 호감도)
    const { count: mCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', participant.id)
    const { count: cCount } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('receiver_id', participant.id).eq('type', 'CUPID')
    const { count: lCount } = await supabase.from('interactions').select('*', { count: 'exact', head: true }).eq('receiver_id', participant.id).eq('type', 'LIKE')
    
    // 내 프로필 정보 (남은 횟수 및 신청 상태)
    const { data: me } = await supabase.from('participants').select('*').eq('id', participant.id).single()

    setStats({
      messages: mCount || 0,
      cupid: cCount || 0,
      likes: lCount || 0
    })
    if (me) setMyProfile(me)
  }

  const triggerHaptic = () => {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_VIBRATION !== 'OFF'
    if (isEnabled && typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10)
    }
  }

  const handleInteraction = async (type: 'CUPID' | 'LIKE') => {
    triggerHaptic()
    if (!participant?.id || !selectedUser || !myProfile) return
    
    const countField = type === 'CUPID' ? 'cupid_count' : 'like_count'
    if (myProfile[countField] <= 0) {
      toast.error(`남은 ${type === 'CUPID' ? '큐피트' : '호감도'} 횟수가 없습니다!`)
      return
    }

    const { allowed, remaining } = checkRateLimit(participant.id)
    if (!allowed) {
      toast.error(`${remaining}초 후에 다시 시도해주세요.`)
      return
    }

    // 1. 상호작용 기록 추가
    const { error: insError } = await supabase.from('interactions').insert({
      type,
      sender_id: participant.id,
      receiver_id: selectedUser.id,
      session_id: (await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').single()).data?.id
    })

    if (insError) {
      toast.error('전송 실패: ' + insError.message)
      return
    }

    // 2. 내 횟수 차감
    await supabase.from('participants')
      .update({ [countField]: myProfile[countField] - 1 })
      .eq('id', participant.id)

    toast.success(`${selectedUser.nickname}님에게 ${type === 'CUPID' ? '큐피트' : '호감도'}를 보냈습니다!`)
    fetchMyStats()
    setSelectedUser(null)
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !participant?.id || !selectedUser) return
    
    const { allowed, remaining } = checkRateLimit(participant.id)
    if (!allowed) {
      toast.error(`${remaining}초 후에 다시 시도해주세요.`)
      return
    }

    const { error } = await supabase.from('messages').insert({
      content: message,
      sender_id: participant.id,
      receiver_id: selectedUser.id,
      session_id: (await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').single()).data?.id
    })

    if (error) {
      toast.error('쪽지 전송 실패')
    } else {
      toast.success(`${selectedUser.nickname}님에게 쪽지를 보냈습니다.`)
      setMessage('')
      setSelectedUser(null)
    }
  }

  const handleSOS = async () => {
    triggerHaptic()
    if (!participant?.id) return

    const { data: session } = await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').single()
    
    const { error } = await supabase.from('alerts').insert({
      type: 'SOS',
      participant_id: participant.id,
      session_id: session?.id,
      message: `${participant.nickname}님이 도움을 요청했습니다!`
    })

    if (!error) {
      toast.error('관리자에게 SOS 요청을 보냈습니다!')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="w-full max-w-md mx-auto space-y-6 pt-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">파티 현황</h1>
            <p className="text-muted-foreground">{participant?.nickname || '참여자'}님, 환영합니다!</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${myProfile?.is_first_applied ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                1차 신청 {myProfile?.is_first_applied ? 'O' : 'X'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${myProfile?.is_second_applied ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'}`}>
                2차 신청 {myProfile?.is_second_applied ? 'O' : 'X'}
              </span>
            </div>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary animate-pulse">
            LIVE {participants.length + 1}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass border-none text-center p-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
            <p className="text-xl">📩</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Message</p>
            <p className="text-lg font-bold">{stats.messages}</p>
          </Card>
          <Card className="glass border-none text-center p-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cupid/30" />
            <p className="text-xl">💘</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Cupid</p>
            <p className="text-lg font-bold">{stats.cupid}</p>
          </Card>
          <Card className="glass border-none text-center p-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-like/30" />
            <p className="text-xl">⭐</p>
            <p className="text-[10px] uppercase tracking-wider opacity-60">Likes</p>
            <p className="text-lg font-bold">{stats.likes}</p>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-ping"></span>
            참여 중인 사람들
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {participants.map((p) => (
              <Dialog key={p.id}>
                <DialogTrigger 
                  nativeButton={false}
                  render={
                    <Card 
                      className="glass border-none hover:bg-white/10 transition-all cursor-pointer active:scale-95 group"
                      onClick={() => setSelectedUser(p)}
                    />
                  }
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg">
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
                      className="h-24 flex flex-col gap-2 glass border-none hover:bg-cupid/20 relative"
                      onClick={() => handleInteraction('CUPID')}
                    >
                      <Zap className="w-8 h-8 text-cupid" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">큐피트 발사</span>
                        <span className="text-[10px] text-muted-foreground">남음: {myProfile?.cupid_count}</span>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 glass border-none hover:bg-like/20 relative"
                      onClick={() => handleInteraction('LIKE')}
                    >
                      <Heart className="w-8 h-8 text-like" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">호감도 주기</span>
                        <span className="text-[10px] text-muted-foreground">남음: {myProfile?.like_count}</span>
                      </div>
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

      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6 pointer-events-none">
        <Button 
          size="lg" 
          className="rounded-full shadow-2xl bg-sos hover:bg-sos/90 pointer-events-auto h-14 px-6 gap-2"
          onClick={handleSOS}
        >
          <AlertTriangle className="w-5 h-5 animate-pulse" />
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
