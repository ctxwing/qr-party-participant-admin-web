'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageSquare, History } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export function AnnouncementsTab() {
  const [announcementMsg, setAnnouncementMsg] = useState('')
  const [announcementType, setAnnouncementType] = useState('info')
  const [announcementHistory, setAnnouncementHistory] = useState<any[]>([])
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
  const supabase = createClient()

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(20)
    if (data) setAnnouncementHistory(data)
  }, [supabase])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleSendAnnouncement = async () => {
    if (!announcementMsg.trim()) {
      toast.error('공지 내용을 입력해주세요.')
      return
    }

    setIsSendingAnnouncement(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: announcementMsg, type: announcementType })
      })
      const result = await res.json()
      if (res.ok) {
        toast.success('공지가 발송되었습니다.')
        setAnnouncementMsg('')
        fetchAnnouncements()
      } else {
        toast.error('발송 실패', { description: result.error })
      }
    } catch {
      toast.error('서버 연결 오류')
    } finally {
      setIsSendingAnnouncement(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass border-none shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            새 공지 작성
          </CardTitle>
          <CardDescription>모든 참여자의 화면에 즉시 노출되는 메시지를 발송합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase">공지 내용</label>
            <Textarea
              placeholder="예: 잠시 후 10분 뒤에 매칭 게임이 시작됩니다!"
              value={announcementMsg}
              onChange={(e) => setAnnouncementMsg(e.target.value)}
              className="bg-white/5 border-white/10 min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase">메시지 타입</label>
            <div className="flex gap-2">
              {['info', 'warning', 'important'].map((t) => (
                <Button
                  key={t}
                  variant={announcementType === t ? 'default' : 'outline'}
                  onClick={() => setAnnouncementType(t)}
                  className={`capitalize ${announcementType === t ? 'bg-indigo-600' : 'border-white/10 text-zinc-400'}`}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold"
            disabled={isSendingAnnouncement}
            onClick={handleSendAnnouncement}
          >
            {isSendingAnnouncement ? '발송 중...' : '공지 즉시 발송'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="glass border-none shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-300">
            <History className="w-5 h-5" />
            최근 공지 이력
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto px-6 pb-6 space-y-4">
            {announcementHistory.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">발송된 공지가 없습니다.</p>
            ) : (
              announcementHistory.map((a) => (
                <div key={a.id} className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-[10px] capitalize opacity-60">{a.type}</Badge>
                    <span className="text-[10px] text-zinc-500">{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-zinc-200">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
