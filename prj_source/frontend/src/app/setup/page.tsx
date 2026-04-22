'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SetupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { participant, setParticipant } = useStore()
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 이미 닉네임이 설정되어 있다면 대시보드로 이동
  useEffect(() => {
    if (!authLoading && participant?.nickname) {
      router.push('/dashboard')
    }
  }, [authLoading, participant, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      // TODO: 실제 DB 연동 (T009에서 구현)
      // 현재는 Mock으로 처리
      const mockParticipant = {
        id: user?.id || 'temp-id',
        nickname: nickname.trim(),
        nicknameChangeCount: 1
      }
      
      setParticipant(mockParticipant)
      toast.success('닉네임 설정이 완료되었습니다!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('닉네임 설정 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) return <div className="flex h-screen items-center justify-center">로딩 중...</div>

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            파티에 오신 것을<br />환영합니다!
          </h1>
        </div>

        <Card className="glass border-none shadow-2xl">
          <CardHeader>
            <CardTitle>닉네임 설정</CardTitle>
            <CardDescription>
              현장에서 불릴 닉네임을 입력하세요. (최대 3회 변경 가능)
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Input
                placeholder="상큼체리, 젠틀맨 등..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-12 text-lg"
                autoFocus
              />
              <p className="mt-2 text-xs text-muted-foreground text-right">
                남은 변경 횟수: 3회
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? '설정 중...' : '파티 시작하기'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
