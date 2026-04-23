'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Play, Square, Users, MessageSquare, AlertCircle, CheckCircle2, Music, UserCog, History, Lock, Eye, EyeOff, Calendar, Fingerprint, ShieldCheck, ArrowRight, Settings2, Clock, Activity } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { defaultColDef, AG_GRID_THEME } from '@/lib/ag-grid-setup'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login")
    }
  }, [session, isPending, router])

  const handleLogout = async () => {
    await signOut()
    toast.success('로그아웃 되었습니다.')
    router.push("/admin/login")
  }

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold tracking-widest opacity-50 uppercase">Loading Console...</p>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [sessionStatus, setSessionStatus] = useState<'READY' | 'ONGOING' | 'FINISHED'>('ONGOING')
  const [alerts, setAlerts] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [filterUnapplied, setFilterUnapplied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [participantStats, setParticipantStats] = useState<any>({ received: 0, sent: 0, songs: 0, sos: 0 })
  const [nicknameHistory, setNicknameHistory] = useState<any[]>([])
  const [weights, setWeights] = useState<any>({ like: 1, message: 5, cupid: 10 })
  
  const supabase = createClient()

  const PRESETS: any = {
    balanced: { name: '기본형', desc: '균형 잡힌 점수 산정', weights: { like: 1, message: 5, cupid: 10 } },
    talkative: { name: '소통 중심', desc: '쪽지 소통에 높은 배점', weights: { like: 1, message: 20, cupid: 10 } },
    matching: { name: '매칭 중심', desc: '큐피트 성공에 높은 배점', weights: { like: 1, message: 5, cupid: 50 } }
  }

  useEffect(() => {
    fetchInitialData()

    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, async (payload) => {
        // 실시간 수신 시 닉네임 정보가 포함된 전체 데이터를 다시 가져옵니다. (수동 조인)
        const [alertRes, partRes] = await Promise.all([
          supabase.from('alerts').select('*').eq('id', payload.new.id).single(),
          supabase.from('participants').select('id, nickname')
        ])
        
        if (alertRes.data && partRes.data) {
          const participant = partRes.data.find(p => p.id === alertRes.data.participant_id)
          const newAlert = { ...alertRes.data, participants: participant }
          
          setAlerts(prev => [newAlert, ...prev])
          const title = newAlert.type === 'SOS' ? '🚨 SOS 긴급 요청!' : '🎵 노래 신청 수신!'
          const msg = newAlert.message.split(':').slice(1).join(':') || newAlert.message
          toast(title, {
            description: `from ${participant?.nickname || '참여자'}\n${msg}`,
            duration: 10000,
          })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts' }, () => fetchAlerts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchParticipants())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (selectedParticipant) {
      fetchParticipantDetails(selectedParticipant.id)
    }
  }, [selectedParticipant])

  const fetchInitialData = async () => {
    const { data: session } = await supabase.from('party_sessions').select('status').eq('status', 'ONGOING').maybeSingle()
    setSessionStatus(session?.status as any || 'READY')

    await Promise.all([fetchParticipants(), fetchMessages(), fetchAlerts(), fetchSettings()])
  }

  const fetchSettings = async () => {
    const { data } = await supabase.from('system_settings').select('value').eq('key', 'ranking_weights').maybeSingle()
    if (data) setWeights(data.value)
  }

  const handleUpdateWeights = async () => {
    const { error } = await supabase.from('system_settings').upsert({ key: 'ranking_weights', value: weights })
    if (!error) {
      toast.success('랭킹 가중치가 저장되었습니다.')
    }
  }

  const handleApplyPreset = (presetWeights: any) => {
    setWeights(presetWeights)
    toast.info('프리셋 수치가 적용되었습니다. 하단 저장 버튼을 눌러 확정하세요.')
  }

  const fetchParticipants = async () => {
    const { data } = await supabase.from('participants').select('*').order('nickname')
    if (data) setParticipants(data)
  }

  const fetchMessages = async () => {
    try {
      // 스키마 캐시 문제를 피하기 위해 개별 조회 후 수동 조인
      const [msgRes, partRes] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('participants').select('id, nickname')
      ])

      if (msgRes.data && partRes.data) {
        const partMap = new Map(partRes.data.map(p => [p.id, p]))
        const joinedMessages = msgRes.data.map(m => ({
          ...m,
          sender: partMap.get(m.sender_id),
          receiver: partMap.get(m.receiver_id)
        }))
        setMessages(joinedMessages)
      }
    } catch (error) {
      console.error('Messages fetch error:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const [alertRes, partRes] = await Promise.all([
        supabase.from('alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('participants').select('id, nickname')
      ])

      if (alertRes.data && partRes.data) {
        const partMap = new Map(partRes.data.map(p => [p.id, p]))
        const joinedAlerts = alertRes.data.map(a => ({
          ...a,
          participants: partMap.get(a.participant_id)
        }))
        setAlerts(joinedAlerts)
      }
    } catch (error) {
      console.error('Alerts fetch error:', error)
    }
  }

  const fetchParticipantDetails = async (id: string) => {
    const [received, sent, alertData, history] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', id),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', id),
      supabase.from('alerts').select('type').eq('participant_id', id),
      supabase.from('nickname_history').select('*').eq('participant_id', id).order('created_at', { ascending: false })
    ])

    setParticipantStats({
      received: received.count || 0,
      sent: sent.count || 0,
      songs: alertData.data?.filter(a => a.type === 'MUSIC').length || 0,
      sos: alertData.data?.filter(a => a.type === 'SOS').length || 0
    })

    setNicknameHistory(history.data || [])
  }

  const handleUpdateCount = async (id: string, field: string, value: number) => {
    const { error } = await supabase.from('participants').update({ [field]: value }).eq('id', id)
    if (!error) {
      toast.success('횟수가 조정되었습니다.')
      fetchParticipants()
    }
  }

  const handleToggleApply = async (id: string, field: string, current: boolean) => {
    await supabase.from('participants').update({ [field]: !current }).eq('id', id)
    toast.success('신청 상태가 변경되었습니다.')
    fetchParticipants()
  }

  const handleToggleSession = async () => {
    if (sessionStatus === 'ONGOING') {
      if (!window.confirm('정말 파티를 종료하시겠습니까? 종료 후에는 참여자들이 더 이상 활동할 수 없습니다.')) {
        return
      }
      await supabase.from('party_sessions').update({ status: 'FINISHED', end_time: new Date().toISOString() }).eq('status', 'ONGOING')
      setSessionStatus('FINISHED')
      toast.success('세션이 종료되었습니다.')
    } else {
      const title = prompt('행사명을 입력하세요', '오늘의 파티') || '오늘의 파티'
      await supabase.from('party_sessions').insert({ status: 'ONGOING', title, start_time: new Date().toISOString() })
      setSessionStatus('ONGOING')
      toast.success('새로운 세션이 시작되었습니다.')
    }
    fetchInitialData()
  }

  const filteredParticipants = participants.filter(p => {
    const matchesFilter = filterUnapplied ? !p.is_second_applied : true
    const matchesSearch = p.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yy = d.getFullYear().toString().slice(2)
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    const ss = pad(d.getSeconds())
    return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }

  const handleToggleResolve = async (id: string, current: boolean) => {
    if (!id) {
      console.warn('Alert ID is missing')
      return
    }
    
    console.log('Toggling alert:', id, 'from', current, 'to', !current)
    
    const { error } = await supabase
      .from('alerts')
      .update({ resolved: !current })
      .eq('id', id)

    if (error) {
      console.error('Update alert error:', JSON.stringify(error, null, 2))
      toast.error('상태 변경 실패: ' + (error.message || '로그 확인'))
    } else {
      toast.success(current ? '미해결 상태로 변경' : '해결 완료 처리')
      fetchAlerts()
    }
  }

  const alertColumnDefs: ColDef[] = [
    { 
      field: 'created_at', 
      headerName: '시간', 
      width: 160,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'type', 
      headerName: '구분', 
      width: 100,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'SOS' ? 'destructive' : 'default'} className="font-bold">
          {params.value === 'SOS' ? '🚨 SOS' : '🎵 MUSIC'}
        </Badge>
      )
    },
    { 
      headerName: '요청자', 
      width: 150,
      valueGetter: (params: any) => params.data.participants?.nickname || '시스템',
      cellRenderer: (params: any) => <span className="font-black text-primary">{params.value}</span>
    },
    { 
      field: 'message', 
      headerName: '내용', 
      flex: 2,
      cellRenderer: (params: any) => <span className="text-sm opacity-90">{params.value.split(':').slice(1).join(':') || params.value}</span>
    },
    { 
      field: 'resolved', 
      headerName: '해결', 
      width: 100,
      cellRenderer: (params: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch 
            checked={params.value} 
            onCheckedChange={() => handleToggleResolve(params.data.id, params.value)}
            label={params.value ? '완료' : '대기'}
            className="gap-2"
          />
        </div>
      )
    }
  ]

  const messageColumnDefs: ColDef[] = [
    { 
      field: 'created_at', 
      headerName: '시간', 
      width: 160,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      headerName: '보낸이', 
      width: 150,
      valueGetter: (params: any) => params.data.sender?.nickname || '알수없음',
      cellRenderer: (params: any) => <span className="font-black text-primary">{params.value}</span>
    },
    { 
      headerName: '', 
      width: 50,
      cellRenderer: () => <ArrowRight className="w-4 h-4 text-white/20" />,
      filter: false,
      sortable: false
    },
    { 
      headerName: '받는이', 
      width: 150,
      valueGetter: (params: any) => params.data.receiver?.nickname || '알수없음',
      cellRenderer: (params: any) => <span className="font-black text-blue-400">{params.value}</span>
    },
    { 
      field: 'content', 
      headerName: '내용', 
      flex: 1,
      cellRenderer: (params: any) => <span className="text-sm">{params.value}</span>
    }
  ]

  const columnDefs: ColDef[] = [
    { 
      field: 'nickname', 
      headerName: '닉네임', 
      flex: 1,
      cellRenderer: (params: any) => <span className="font-bold">{params.value}</span>
    },
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      cellRenderer: (params: any) => <span className="text-[10px] opacity-30 font-mono">{params.value.split('-')[0]}</span>,
      filter: false
    },
    { 
      field: 'created_at', 
      headerName: '가입일', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'last_participated_at', 
      headerName: '참여일', 
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'is_first_applied', 
      headerName: '1차', 
      width: 80,
      cellRenderer: (params: any) => (
        <Badge 
          onClick={() => handleToggleApply(params.data.id, 'is_first_applied', params.value)} 
          className="cursor-pointer" 
          variant={params.value ? 'default' : 'secondary'}
        >
          {params.value ? 'O' : 'X'}
        </Badge>
      )
    },
    { 
      field: 'is_second_applied', 
      headerName: '2차', 
      width: 80,
      cellRenderer: (params: any) => (
        <Badge 
          onClick={() => handleToggleApply(params.data.id, 'is_second_applied', params.value)} 
          className="cursor-pointer" 
          variant={params.value ? 'default' : 'secondary'}
        >
          {params.value ? 'O' : 'X'}
        </Badge>
      )
    },
    { 
      field: 'cupid_count', 
      headerName: '큐피트', 
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 h-full">
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'cupid_count', (params.value || 0) - 1)}>-</button>
          <span className="w-4 text-center">{params.value || 0}</span>
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'cupid_count', (params.value || 0) + 1)}>+</button>
        </div>
      )
    },
    { 
      field: 'like_count', 
      headerName: '호감도', 
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 h-full">
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'like_count', (params.value || 0) - 1)}>-</button>
          <span className="w-4 text-center">{params.value || 0}</span>
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'like_count', (params.value || 0) + 1)}>+</button>
        </div>
      )
    },
    {
      headerName: '액션',
      width: 80,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 hover:bg-blue-500/20 text-blue-400"
            onClick={() => setSelectedParticipant(params.data)}
          >
            <UserCog className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-8 relative overflow-hidden">
      <div className="premium-blur-bg opacity-30" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-vibrant-gradient">
            <Settings2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">ADMIN CONSOLE</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Operational</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="btn-glass-premium bg-white/5 border-white/10 h-12 w-48 font-bold" onClick={onLogout}>LOGOUT</Button>
          <Button 
            className={`h-12 w-48 font-black rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 ${sessionStatus === 'ONGOING' ? 'bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 hover:bg-white/10' : 'bg-vibrant-gradient text-white hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}
            onClick={handleToggleSession}
          >
            {sessionStatus === 'ONGOING' ? (
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 fill-current text-white/40" /> STOP PARTY
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> START PARTY
              </div>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="max-w-7xl mx-auto relative z-10 px-4">
        <div className="flex justify-center mb-12">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 h-auto rounded-full flex flex-wrap md:flex-nowrap gap-1 items-center justify-center backdrop-blur-md">
            <TabsTrigger value="dashboard" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">현황판</TabsTrigger>
            <TabsTrigger value="participants" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">참여자 관리</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">참여자간 쪽지</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">시스템 설정</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 참여자 카드 */}
            <Card className="glass border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Active Participants</CardDescription>
                <CardTitle className="text-4xl font-black text-blue-400 text-glow">{participants.length}</CardTitle>
              </CardHeader>
            </Card>

            {/* 메시지 카드 */}
            <Card className="glass border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Total Messages</CardDescription>
                <CardTitle className="text-4xl font-black text-emerald-400 text-glow">{messages.length}</CardTitle>
              </CardHeader>
            </Card>

            {/* SOS 카드 */}
            <Card className="glass border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-sos" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">SOS Requests</CardDescription>
                <CardTitle className="text-4xl font-black text-sos text-glow">
                  {alerts.filter(a => a.type==='SOS').length}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">완료 {alerts.filter(a => a.type==='SOS' && a.resolved).length}</Badge>
                  <Badge variant="outline" className="text-[10px] bg-sos/10 text-sos border-sos/20">미완료 {alerts.filter(a => a.type==='SOS' && !a.resolved).length}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* 노래신청 카드 */}
            <Card className="glass border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Song Requests</CardDescription>
                <CardTitle className="text-4xl font-black text-purple-400 text-glow">
                  {alerts.filter(a => a.type==='MUSIC').length}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">완료 {alerts.filter(a => a.type==='MUSIC' && a.resolved).length}</Badge>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">미완료 {alerts.filter(a => a.type==='MUSIC' && !a.resolved).length}</Badge>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="glass border-none shadow-2xl overflow-hidden mt-8">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  실시간 요청 처리 이력 (SOS / 노래)
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-white/40 border-white/10">{alerts.length} Total Alerts</Badge>
                  <Button variant="ghost" size="sm" onClick={fetchAlerts} className="hover:bg-white/5"><Activity className="w-3 h-3 mr-2" /> Refresh</Button>
                </div>
              </div>
            </CardHeader>
            <div className={`${AG_GRID_THEME} w-full h-[500px] border-none`}>
              <AgGridReact
                rowData={alerts}
                columnDefs={alertColumnDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                rowHeight={60}
                theme="legacy"
                defaultColDef={defaultColDef}
              />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants" className="space-y-6">

          <Card className="glass border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                  <Input 
                    placeholder="참여자 닉네임 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 pl-10 focus:ring-primary/20"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className={`h-12 px-6 glass border-white/10 ${filterUnapplied ? 'bg-primary/20 text-primary-foreground' : ''}`}
                    onClick={() => setFilterUnapplied(!filterUnapplied)}
                  >
                    {filterUnapplied ? "전체 보기" : "2차 미신청자 필터"}
                  </Button>
                  <div className="h-12 px-4 glass border-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Total</span>
                    <span className="text-lg font-black text-primary">{filteredParticipants.length}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <div className={`${AG_GRID_THEME} w-full h-[600px] border-none shadow-inner`}>
              <AgGridReact
                rowData={filteredParticipants}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                rowHeight={56}
                theme="legacy"
                defaultColDef={defaultColDef}
              />
            </div>
          </Card>

        </TabsContent>

        <TabsContent value="messages">
          <Card className="glass border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  참여자간 쪽지 모니터링
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-white/40 border-white/10">{messages.length} Messages</Badge>
                  <Button variant="ghost" size="sm" onClick={fetchMessages} className="hover:bg-white/5"><Activity className="w-3 h-3 mr-2" /> Refresh</Button>
                </div>
              </div>
            </CardHeader>
            <div className={`${AG_GRID_THEME} w-full h-[650px] border-none shadow-inner`}>
              <AgGridReact
                rowData={messages}
                columnDefs={messageColumnDefs}
                pagination={true}
                paginationPageSize={20}
                rowHeight={56}
                theme="legacy"
                defaultColDef={defaultColDef}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-400" />
                시스템 설정
              </CardTitle>
              <CardDescription>랭킹 산정 가중치 및 시스템 전역 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 프리셋 선택 섹션 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-3 h-3 text-blue-500" /> 랭킹 프리셋 선택
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PRESETS).map(([key, p]: [string, any]) => (
                    <button 
                      key={key}
                      onClick={() => handleApplyPreset(p.weights)}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                    >
                      <p className="font-bold group-hover:text-blue-400">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 세부 설정 섹션 */}
              <div className="space-y-4 max-w-md bg-slate-950 p-6 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">세부 가중치 설정</h3>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <label className="text-sm">좋아요 (Like)</label>
                  <Input 
                    type="number" 
                    value={weights.like} 
                    onChange={(e) => setWeights({...weights, like: parseInt(e.target.value)})}
                    className="bg-slate-900 border-slate-800"
                  />
                  
                  <label className="text-sm">쪽지 수신 (Message)</label>
                  <Input 
                    type="number" 
                    value={weights.message} 
                    onChange={(e) => setWeights({...weights, message: parseInt(e.target.value)})}
                    className="bg-slate-900 border-slate-800"
                  />
                  
                  <label className="text-sm">큐피트 매칭 (Cupid)</label>
                  <Input 
                    type="number" 
                    value={weights.cupid} 
                    onChange={(e) => setWeights({...weights, cupid: parseInt(e.target.value)})}
                    className="bg-slate-900 border-slate-800"
                  />
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500" onClick={handleUpdateWeights}>
                  설정 저장 및 적용
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 참여자 상세 정보 모달 */}
      <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <UserCog className="text-blue-400" />
              참여자 상세 정보
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedParticipant?.nickname}님의 시스템 기록입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <Fingerprint className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Unique UUID</p>
                    <p className="text-xs font-mono break-all text-blue-300">{selectedParticipant.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <Calendar className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">가입일시</p>
                    <p className="text-xs">{new Date(selectedParticipant.created_at).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <History className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">최근참여</p>
                    <p className="text-xs">{selectedParticipant.last_participated_at ? new Date(selectedParticipant.last_participated_at).toLocaleString() : '-'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-2">활동 통계</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> 받은 쪽지</span>
                      <span className="font-bold text-blue-400">{participantStats.received}개</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><MessageSquare className="w-3 h-3 opacity-50" /> 보낸 쪽지</span>
                      <span className="font-bold">{participantStats.sent}개</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><Music className="w-3 h-3" /> 노래 신청</span>
                      <span className="font-bold text-green-400">{participantStats.songs}회</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> SOS 요청</span>
                      <span className="font-bold text-red-400">{participantStats.sos}회</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                    <History className="w-3 h-3" /> 닉네임 변경 이력
                  </p>
                  {nicknameHistory.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">변경 이력이 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {nicknameHistory.map((h, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-slate-900/50 rounded border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 line-through">{h.old_nickname}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="font-bold text-blue-300">{h.new_nickname}</span>
                          </div>
                          <span className="text-slate-600">{new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">1차 신청</p>
                      <p className="text-sm font-bold">{selectedParticipant.is_first_applied ? '신청완료' : '미신청'}</p>
                    </div>
                    {selectedParticipant.is_first_applied && <ShieldCheck className="text-green-500 w-5 h-5" />}
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">2차 신청</p>
                      <p className="text-sm font-bold">{selectedParticipant.is_second_applied ? '신청완료' : '미신청'}</p>
                    </div>
                    {selectedParticipant.is_second_applied && <ShieldCheck className="text-green-500 w-5 h-5" />}
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 flex justify-around">
                  <div className="text-center">
                    <p className="text-[10px] text-blue-400 uppercase font-bold">큐피트 횟수</p>
                    <p className="text-2xl font-black text-blue-50">{selectedParticipant.cupid_count || 0}</p>
                  </div>
                  <div className="w-[1px] bg-blue-500/20" />
                  <div className="text-center">
                    <p className="text-[10px] text-blue-400 uppercase font-bold">호감 표시</p>
                    <p className="text-2xl font-black text-blue-50">{selectedParticipant.like_count || 0}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => setSelectedParticipant(null)}>확인</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
