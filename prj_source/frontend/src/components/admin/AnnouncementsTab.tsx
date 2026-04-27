'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageSquare, History, Trash2 } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { defaultColDef, AG_GRID_THEME } from '@/lib/ag-grid-setup'
import { createClient } from '@/lib/supabase'

function AnnouncementHistoryGrid({ data, onSelectTemplate }: { data: any[]; onSelectTemplate: (announcement: any) => void }) {
  const getTypeBadgeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'important':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const columnDefs: ColDef[] = [
    {
      field: 'created_at',
      headerName: '발송 시각',
      width: 160,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'type',
      headerName: '타입',
      width: 90,
      cellRenderer: (params: any) => (
        <Badge variant={getTypeBadgeVariant(params.value)} className="capitalize">
          {params.value}
        </Badge>
      ),
      filter: false
    },
    {
      field: 'content',
      headerName: '내용',
      flex: 1,
      cellRenderer: (params: any) => <span className="text-sm text-zinc-200">{params.value}</span>
    },
    {
      headerName: '작업',
      width: 100,
      cellRenderer: (params: any) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-blue-400 hover:bg-blue-500/20"
          onClick={() => onSelectTemplate(params.data)}
        >
          수정 발송
        </Button>
      ),
      filter: false,
      sortable: false
    }
  ]

  return (
    <div className={`${AG_GRID_THEME} w-full h-[400px] border-none shadow-inner`}>
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
        rowHeight={56}
        theme="legacy"
        defaultColDef={defaultColDef}
      />
    </div>
  )
}

const MAX_ANNOUNCEMENT_LENGTH = 300

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

  const handleSelectTemplate = (announcement: any) => {
    setAnnouncementMsg(announcement.content)
    setAnnouncementType(announcement.type)
    toast.success('템플릿 로드 완료. 수정 후 신규 메시지로 발송됩니다.')
  }

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
        setAnnouncementType('info')
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
          <div className="space-y-2">
            <CardDescription>모든 참여자의 화면에 즉시 노출되는 메시지를 발송합니다.</CardDescription>
            <p className="text-xs text-blue-300/70">💡 최근 공지 이력의 우측 '수정 발송' 버튼을 통해 기존 메시지를 불러와 수정 후 발송할 수 있습니다.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase">공지 내용</label>
            <div className="relative">
              <Textarea
                placeholder="예: 잠시 후 10분 뒤에 매칭 게임이 시작됩니다!"
                value={announcementMsg}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_ANNOUNCEMENT_LENGTH) {
                    setAnnouncementMsg(e.target.value)
                  }
                }}
                className="bg-white/5 border-white/10 min-h-[120px]"
              />
              <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
                {announcementMsg.length}/{MAX_ANNOUNCEMENT_LENGTH}
              </div>
            </div>
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
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="flex items-center gap-2 text-zinc-300">
            <History className="w-5 h-5" />
            최근 공지 이력
          </CardTitle>
        </CardHeader>
        <AnnouncementHistoryGrid data={announcementHistory} onSelectTemplate={handleSelectTemplate} />
      </Card>
    </div>
  )
}
