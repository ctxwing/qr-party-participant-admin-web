'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useRealtime } from '@/hooks/useRealtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { MessageCircle, Heart, Zap, Award, AlertTriangle, Edit2 } from 'lucide-react'
import { checkRateLimit } from '@/lib/rateLimit'
import { createClient } from '@/lib/supabase'
import { updateNickname } from '@/app/actions/nickname'
import Link from 'next/link'

function SosForm({ onSubmit }: { onSubmit: (msg: string) => void }) {
  const [sosMessage, setSosMessage] = useState('')
  return (
    <div className="space-y-4 py-4">
      <Input 
        placeholder="요청 내용을 입력하세요 (생략 가능)" 
        value={sosMessage}
        onChange={(e) => setSosMessage(e.target.value)}
        className="glass border-none"
      />
      <Button variant="destructive" className="w-full font-bold h-12" onClick={() => {
        onSubmit(sosMessage)
        setSosMessage('')
      }}>SOS 요청하기</Button>
    </div>
  )
}

function GlobalMusicForm({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [songTitle, setSongTitle] = useState('')
  return (
    <div className="space-y-4 py-4">
      <Input 
        placeholder="곡 제목을 입력하세요 (생략 가능)" 
        value={songTitle}
        onChange={(e) => setSongTitle(e.target.value)}
        className="glass border-none"
      />
      <Button className="w-full font-bold h-12" onClick={() => {
        onSubmit(songTitle)
        setSongTitle('')
      }}>신청하기</Button>
    </div>
  )
}

function ParticipantMusicForm({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [songTitle, setSongTitle] = useState('')
  return (
    <div className="flex gap-2">
      <Input 
        placeholder="곡 제목을 입력하세요..." 
        value={songTitle}
        onChange={(e) => setSongTitle(e.target.value)}
        className="glass border-none"
      />
      <Button onClick={() => {
        onSubmit(songTitle)
        setSongTitle('')
      }}>
        요청
      </Button>
    </div>
  )
}

function ParticipantMessageForm({ onSubmit }: { onSubmit: (msg: string) => void }) {
  const [message, setMessage] = useState('')
  return (
    <div className="flex gap-2">
      <Input 
        placeholder="쪽지 내용을 입력하세요..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="glass border-none"
      />
      <Button size="icon" onClick={() => {
        onSubmit(message)
        setMessage('')
      }}>
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function DashboardPage() {
  const { participant, setParticipant } = useStore()
  useRealtime(participant?.id)
  
  const [participants, setParticipants] = useState<any[]>([])
  const [stats, setStats] = useState({ messages: 0, cupid: 0, likes: 0 })
  const [myProfile, setMyProfile] = useState<any>(null)
  const [newNickname, setNewNickname] = useState('')
  const [isChangingNickname, setIsChangingNickname] = useState(false)
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [openInteractionId, setOpenInteractionId] = useState<string | null>(null)
  const [lastInteractionTime, setLastInteractionTime] = useState(0)
  
  const [isSosOpen, setIsSosOpen] = useState(false)
  const [isMusicOpen, setIsMusicOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (!participant?.id) return
    fetchParticipants()
    fetchMyStats()
    fetchActiveSession()

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

  const fetchActiveSession = async () => {
    const { data } = await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').maybeSingle()
    if (data) setSessionId(data.id)
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

  const handleInteraction = async (type: 'CUPID' | 'LIKE', targetUserId: string, targetNickname: string) => {
    triggerHaptic()
    if (!participant?.id || !myProfile) return
    if (!sessionId) {
      toast.error('활성화된 파티 세션이 없습니다.')
      return
    }
    
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
      receiver_id: targetUserId,
      session_id: sessionId
    })

    if (insError) {
      toast.error('전송 실패: ' + insError.message)
      return
    }

    // 2. 내 횟수 차감
    await supabase.from('participants')
      .update({ [countField]: myProfile[countField] - 1 })
      .eq('id', participant.id)

    toast.success(`${targetNickname}님에게 ${type === 'CUPID' ? '큐피트' : '호감도'}를 보냈습니다!`)
    fetchMyStats()
    setOpenInteractionId(null)
  }

  const handleSendMessage = async (msg: string, targetUserId: string, targetNickname: string) => {
    if (!msg.trim() || !participant?.id) return
    if (!sessionId) {
      toast.error('활성화된 파티 세션이 없습니다.')
      return
    }
    
    const { allowed, remaining } = checkRateLimit(participant.id)
    if (!allowed) {
      toast.error(`${remaining}초 후에 다시 시도해주세요.`)
      return
    }

    const { error } = await supabase.from('messages').insert({
      content: msg,
      sender_id: participant.id,
      receiver_id: targetUserId,
      session_id: sessionId
    })

    if (error) {
      toast.error('쪽지 전송 실패')
    } else {
      toast.success(`${targetNickname}님에게 쪽지를 보냈습니다.`)
      setOpenInteractionId(null)
    }
  }

  const handleSOS = async (msg: string) => {
    triggerHaptic()
    if (!participant?.id) return

    const { data: session } = await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').maybeSingle()
    if (!session?.id) {
      toast.error('활성화된 파티 세션이 없습니다.')
      return
    }
    
    const { error } = await supabase.from('alerts').insert({
      type: 'SOS',
      participant_id: participant.id,
      session_id: session?.id,
      message: msg.trim() ? `🚨 SOS: ${msg}` : `🚨 ${participant.nickname}님이 도움을 요청했습니다!`
    })

    if (!error) {
      toast.error('관리자에게 SOS 요청을 보냈습니다!')
      setIsSosOpen(false)
    } else {
      toast.error('SOS 전송 실패: ' + error.message)
    }
  }

  const handleSongRequest = async (title: string, receiverId?: string, targetNickname?: string) => {
    if (!participant?.id) return
    if (!sessionId) {
      toast.error('활성화된 파티 세션이 없습니다.')
      return
    }
    
    // 쿨타임 체크
    const now = Date.now()
    if (now - lastInteractionTime < 3000) {
      toast.error('상호작용이 너무 잦습니다. 3초 후 다시 시도해주세요.')
      return
    }

    if (!title.trim() && receiverId) {
      toast.error('신청할 곡 제목을 입력해주세요.')
      return
    }

    setLastInteractionTime(now)
    triggerHaptic()

    const alertMessage = receiverId 
      ? `🎵 ${targetNickname}님에게 노래를 신청했습니다: ${title.trim()}`
      : `🎵 노래 신청: ${title.trim()}`

    const { error } = await supabase.from('alerts').insert({
      type: 'MUSIC',
      participant_id: participant.id,
      receiver_id: receiverId || null,
      session_id: sessionId,
      message: alertMessage
    })

    if (!error) {
      toast.success(receiverId ? `${targetNickname}님에게 노래를 요청했습니다!` : '노래 신청을 보냈습니다!')
      if (receiverId) {
        setOpenInteractionId(null)
      } else {
        setIsMusicOpen(false)
      }
    } else {
      toast.error('노래 신청 실패: ' + error.message)
    }
  }

  const handleNicknameChange = async () => {
    if (!newNickname.trim() || !participant?.id) return
    if (newNickname === participant.nickname) {
      toast.error('현재와 동일한 닉네임입니다.')
      return
    }

    setIsChangingNickname(true)
    const result = await updateNickname(participant.id, newNickname.trim())
    
    if (result.success) {
      setParticipant({
        ...participant,
        nickname: newNickname.trim(),
        nicknameChangeCount: result.newCount || (participant.nicknameChangeCount + 1)
      })
      toast.success('닉네임이 변경되었습니다.')
      fetchMyStats()
      setIsNicknameDialogOpen(false)
    } else {
      toast.error(result.error)
    }
    setIsChangingNickname(false)
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="w-full max-w-md mx-auto space-y-6 pt-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">파티 현황</h1>
            <div className="flex items-center gap-1">
              <p className="text-muted-foreground">{participant?.nickname || '참여자'}님, 환영합니다!</p>
              <Dialog open={isNicknameDialogOpen} onOpenChange={setIsNicknameDialogOpen}>
                <DialogTrigger 
                  render={
                    <Button variant="ghost" size="icon" className="opacity-40 hover:opacity-100 h-6 w-6">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  }
                />
                <DialogContent className="glass border-none max-w-[90%] rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-center">닉네임 변경</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">현재 닉네임: <span className="font-bold text-foreground">{participant?.nickname}</span></p>
                      <Input 
                        placeholder="새로운 닉네임 입력" 
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="glass border-none h-12"
                      />
                      <p className="text-[10px] text-right text-muted-foreground">남은 변경 횟수: {3 - (myProfile?.nickname_change_count || 0)}회</p>
                    </div>
                    <Button 
                      className="w-full h-12 font-bold" 
                      onClick={handleNicknameChange}
                      disabled={isChangingNickname || (myProfile?.nickname_change_count >= 3)}
                    >
                      {isChangingNickname ? '변경 중...' : '닉네임 변경하기'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${myProfile?.is_first_applied ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                1차 신청 {myProfile?.is_first_applied ? 'O' : 'X'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${myProfile?.is_second_applied ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'}`}>
                2차 신청 {myProfile?.is_second_applied ? 'O' : 'X'}
              </span>
            </div>
          </div>
          <div className="flex bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary animate-pulse items-center gap-2">
            <span>LIVE {participants.length + 1}</span>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              className="ml-2 text-[10px] opacity-60 hover:opacity-100 underline"
            >
              EXIT
            </button>
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
              <Dialog key={p.id} open={openInteractionId === p.id} onOpenChange={(open) => setOpenInteractionId(open ? p.id : null)}>
                <DialogTrigger 
                  nativeButton={false}
                  render={
                    <Card 
                      className="glass border-none hover:bg-white/10 transition-all cursor-pointer active:scale-95 group"
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
                      onClick={() => handleInteraction('CUPID', p.id, p.nickname)}
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
                      onClick={() => handleInteraction('LIKE', p.id, p.nickname)}
                    >
                      <Heart className="w-8 h-8 text-like" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">호감도 주기</span>
                        <span className="text-[10px] text-muted-foreground">남음: {myProfile?.like_count}</span>
                      </div>
                    </Button>
                  </div>
                  <div className="space-y-4 border-t border-white/5 pt-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground px-1">🎵 {p.nickname}님에게 노래 요청</p>
                      <ParticipantMusicForm onSubmit={(title) => handleSongRequest(title, p.id, p.nickname)} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground px-1">📩 익명 쪽지 보내기</p>
                      <ParticipantMessageForm onSubmit={(msg) => handleSendMessage(msg, p.id, p.nickname)} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 px-6 pointer-events-none">
        <Dialog open={isSosOpen} onOpenChange={setIsSosOpen}>
          <DialogTrigger 
            render={
              <Button 
                className="rounded-full shadow-2xl bg-sos hover:bg-sos/90 pointer-events-auto h-14 w-14 p-0 flex items-center justify-center cursor-pointer"
                onClick={triggerHaptic}
              />
            }
          >
            <AlertTriangle className="w-5 h-5 animate-pulse text-white" />
          </DialogTrigger>
          <DialogContent className="glass border-none max-w-[90%] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">도움이 필요하신가요? 🚨</DialogTitle>
            </DialogHeader>
            <SosForm onSubmit={handleSOS} />
          </DialogContent>
        </Dialog>

        <Dialog open={isMusicOpen} onOpenChange={setIsMusicOpen}>
          <DialogTrigger 
            render={
              <Button 
                className="rounded-full shadow-2xl bg-blue-500 hover:bg-blue-600 pointer-events-auto h-14 px-6 gap-2 flex items-center justify-center cursor-pointer"
                onClick={triggerHaptic}
              />
            }
          >
            <Zap className="w-5 h-5 fill-current text-white" />
            <span className="font-bold uppercase tracking-tight text-white">Music</span>
          </DialogTrigger>
          <DialogContent className="glass border-none max-w-[90%] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">노래를 신청하시겠어요? 🎵</DialogTitle>
            </DialogHeader>
            <GlobalMusicForm onSubmit={handleSongRequest} />
          </DialogContent>
        </Dialog>

        <Link href="/ranking" className="pointer-events-auto">
          <Button 
            size="lg" 
            className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 h-14 px-6 gap-2"
            onClick={triggerHaptic}
          >
            <Award className="w-5 h-5" />
            <span className="font-bold">RANK</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
