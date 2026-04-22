'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Play, Square, Users, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function AdminDashboard() {
  const [sessionStatus, setSessionStatus] = useState<'READY' | 'ONGOING' | 'FINISHED'>('ONGOING')
  const [sosRequests, setSosRequests] = useState<any[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()

    const alertsChannel = supabase.channel('admin-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts', filter: "type=eq.SOS" }, payload => {
        setSosRequests(prev => [payload.new, ...prev])
        toast.error('새로운 SOS 요청이 수신되었습니다!')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(alertsChannel)
    }
  }, [])

  const fetchInitialData = async () => {
    // 세션 정보
    const { data: session } = await supabase.from('party_sessions').select('status').eq('status', 'ONGOING').single()
    if (session) setSessionStatus(session.status as 'ONGOING' | 'FINISHED')
    else setSessionStatus('READY')

    // 통계
    const { count: pCount } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    setParticipantCount(pCount || 0)

    const { count: mCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })
    setMessageCount(mCount || 0)

    // SOS 요청
    const { data: alerts } = await supabase.from('alerts').select(`
      id, created_at, message, is_resolved,
      participants ( nickname )
    `).eq('type', 'SOS').order('created_at', { ascending: false })
    
    if (alerts) setSosRequests(alerts)
  }

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return
    
    // 현재 세션 가져오기
    const { data: session } = await supabase.from('party_sessions').select('id').eq('status', 'ONGOING').single()
    if (!session) {
      toast.error('활성화된 파티 세션이 없습니다.')
      return
    }

    const { error } = await supabase.from('alerts').insert({
      session_id: session.id,
      type: 'SYSTEM',
      message: announcement
    })

    if (error) {
      toast.error('공지사항 발송에 실패했습니다.')
    } else {
      toast.success('전체 공지사항이 발송되었습니다: ' + announcement)
      setAnnouncement('')
    }
  }

  const handleToggleSession = async () => {
    const nextStatus = sessionStatus === 'ONGOING' ? 'FINISHED' : 'ONGOING'
    
    if (nextStatus === 'ONGOING') {
      await supabase.from('party_sessions').insert({
        title: "환영 파티",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        status: 'ONGOING'
      })
    } else {
      await supabase.from('party_sessions').update({ status: 'FINISHED' }).eq('status', 'ONGOING')
    }
    
    setSessionStatus(nextStatus)
    toast.success(`파티 세션이 ${nextStatus === 'ONGOING' ? '시작' : '종료'}되었습니다.`)
  }

  const resolveSos = async (id: string) => {
    const { error } = await supabase.from('alerts').update({ is_resolved: true }).eq('id', id)
    if (!error) {
      setSosRequests(prev => prev.map(req => req.id === id ? { ...req, is_resolved: true } : req))
      toast.success('SOS 요청이 해결 처리되었습니다.')
    } else {
      toast.error('처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 space-y-8 pb-20">
      {/* Admin Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">ADMIN CONSOLE</h1>
          <p className="text-slate-400">QR Party Manager v1.0</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={sessionStatus === 'ONGOING' ? 'default' : 'secondary'} className="px-4 py-1 text-sm">
            {sessionStatus}
          </Badge>
          <Button 
            variant={sessionStatus === 'ONGOING' ? 'destructive' : 'default'}
            onClick={handleToggleSession}
            className="gap-2 font-bold"
          >
            {sessionStatus === 'ONGOING' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {sessionStatus === 'ONGOING' ? 'STOP PARTY' : 'START PARTY'}
          </Button>
        </div>
      </div>

      {/* Global Announcement Section */}
      <Card className="max-w-6xl mx-auto bg-primary/10 border-primary/20 text-slate-50">
        <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold text-primary uppercase flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Broadcast Announcement
            </p>
            <Input 
              placeholder="모든 참여자에게 보낼 공지사항을 입력하세요..." 
              className="bg-slate-900 border-slate-800"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
          </div>
          <Button onClick={handleSendAnnouncement} className="font-bold px-8">SEND BROADCAST</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Stat Cards */}
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Participants</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3">
              <Users className="text-blue-500" /> {participantCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Messages Sent</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3">
              <MessageSquare className="text-green-500" /> {messageCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Active SOS</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3 text-red-500">
              <AlertCircle /> {sosRequests.filter(r => !r.is_resolved).length}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* SOS Management List */}
        <Card className="md:col-span-3 bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader>
            <CardTitle>SOS Request Queue</CardTitle>
            <CardDescription className="text-slate-400">실시간 참여자 요청 사항 및 응급 호출</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sosRequests.map((sos) => (
                <div 
                  key={sos.id} 
                  className={`p-4 rounded-lg border flex justify-between items-center ${
                    sos.is_resolved ? 'bg-slate-800/30 border-slate-800 opacity-60' : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sos.participants?.nickname || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-500">{new Date(sos.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm">{sos.message}</p>
                  </div>
                  {sos.is_resolved ? (
                    <Badge variant="outline" className="text-green-500 border-green-500 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> RESOLVED
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="hover:bg-green-500 hover:text-white" onClick={() => resolveSos(sos.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
              {sosRequests.length === 0 && (
                <div className="text-center py-8 text-slate-500">수신된 SOS 요청이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
