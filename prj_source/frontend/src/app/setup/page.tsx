'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { registerParticipant } from '@/app/actions/participant'
import { createClient } from '@/lib/supabase'
import { User, Sparkles, PartyPopper } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { participant, setParticipant } = useStore()
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [partyName, setPartyName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchActiveParty = async () => {
      const today = new Date().toISOString()
      const { data } = await supabase
        .from('parties')
        .select('name')
        .eq('status', 'active')
        .lte('start_at', today)
        .gte('end_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data?.name) {
        setPartyName(data.name)
      }
    }
    fetchActiveParty()
  }, [supabase])

  useEffect(() => {
    if (!authLoading && participant?.nickname) {
      router.push('/dashboard')
    }
  }, [authLoading, participant, router])

  useEffect(() => {
    const checkExistingParticipant = async () => {
      if (user && !participant) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('anonymous_id', user.id)
          .maybeSingle()
        
        if (data) {
          setParticipant({
            id: data.id,
            nickname: data.nickname,
            nicknameChangeCount: data.nickname_change_count || 0
          })
          router.push('/dashboard')
        }
      }
    }
    if (!authLoading) {
      checkExistingParticipant()
    }
  }, [authLoading, user, participant, router, supabase, setParticipant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    if (!user) {
      toast.error('인증 정보가 없습니다. 다시 시도해주세요.')
      return
    }

    setSubmitting(true)
    try {
      const result = await registerParticipant(user.id, nickname.trim())

      if (result.success && result.participant) {
        setParticipant({
          id: result.participant.id,
          nickname: result.participant.nickname,
          nicknameChangeCount: result.participant.nickname_change_count || 0
        })
        toast.success('닉네임 설정이 완료되었습니다!')
        router.push('/dashboard')
      } else {
        toast.error(result.error || '등록에 실패했습니다.')
      }
    } catch (error) {
      console.error(error)
      toast.error('닉네임 설정 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-black tracking-tight">인증 정보 확인 중...</p>
          <p className="text-sm text-white/40">당신의 화려한 파티를 준비하고 있어요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      <div className="premium-blur-bg" />
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-vibrant-gradient shadow-lg mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            {partyName ? (
              <>{partyName} 파티에<br />오신 것을 환영합니다!</>
            ) : (
              <>파티에 오신 것을<br />환영합니다!</>
            )}
          </h1>
          <p className="text-white/60 font-medium">현장에서 사용하실 닉네임을 설정해주세요.</p>
        </div>

        <Card className="glass border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-primary" />
              닉네임 설정
            </CardTitle>
            <CardDescription className="text-white/40">
              최대 3회까지 변경 가능합니다.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-4">
              <div className="relative group">
                <Input
                  placeholder="상큼체리, 젠틀맨 등..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-14 text-xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl pl-4 pr-4 text-white placeholder:text-white/20"
                  autoFocus
                  maxLength={15}
                />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
              </div>
              <div className="flex justify-between items-center mt-3 px-1">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">
                  Realtime Sync Enabled
                </p>
                <p className="text-xs text-white/60 font-bold">
                  남은 횟수: <span className="text-primary">3</span>회
                </p>
              </div>
            </CardContent>
            <CardFooter className="pb-8">
              <Button
                type="submit"
                className="w-full h-14 text-xl font-black bg-vibrant-gradient hover:scale-[1.02] active:scale-95 transition-all shadow-xl rounded-xl border-t border-white/20"
                disabled={submitting}
              >
                {submitting ? '준비 중...' : '파티 참여하기'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
          Secure Anonymous Connection
        </p>
      </div>
    </div>
  )
}
