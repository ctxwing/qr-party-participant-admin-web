'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Play, Square, Users, MessageSquare, AlertCircle, CheckCircle2, Music, UserCog, History, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllCommunityModule])

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('로그인 실패: ' + error.message)
    } else {
      toast.success('관리자 로그인 성공')
    }
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('로그아웃 되었습니다.')
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-50">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black">ADMIN LOGIN</CardTitle>
            <CardDescription>관리자 계정으로 로그인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">이메일</label>
                <Input 
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">비밀번호</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>
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
  
  const supabase = createClient()

  useEffect(() => {
    fetchInitialData()

    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setAlerts(prev => [payload.new, ...prev])
        toast(payload.new.type === 'SOS' ? '🚨 SOS 요청 수신!' : '🎵 노래 요청 수신!')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchParticipants())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchInitialData = async () => {
    const { data: session } = await supabase.from('party_sessions').select('status').eq('status', 'ONGOING').maybeSingle()
    setSessionStatus(session?.status as any || 'READY')

    await Promise.all([fetchParticipants(), fetchMessages(), fetchAlerts()])
  }

  const fetchParticipants = async () => {
    const { data } = await supabase.from('participants').select('*').order('nickname')
    if (data) setParticipants(data)
  }

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*, sender:sender_id(nickname), receiver:receiver_id(nickname)').order('created_at', { ascending: false }).limit(50)
    if (data) setMessages(data)
  }

  const fetchAlerts = async () => {
    const { data } = await supabase.from('alerts').select('*, participants(nickname)').order('created_at', { ascending: false })
    if (data) setAlerts(data)
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
    const nextStatus = sessionStatus === 'ONGOING' ? 'FINISHED' : 'ONGOING'
    if (nextStatus === 'ONGOING') {
      await supabase.from('party_sessions').insert({ status: 'ONGOING', title: 'Party', start_time: new Date().toISOString() })
    } else {
      await supabase.from('party_sessions').update({ status: 'FINISHED' }).eq('status', 'ONGOING')
    }
    setSessionStatus(nextStatus)
    toast.success(`세션 ${nextStatus}`)
  }

  const filteredParticipants = participants.filter(p => {
    const matchesFilter = filterUnapplied ? !p.is_second_applied : true
    const matchesSearch = p.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // AG Grid Column Definitions
  const columnDefs: ColDef[] = [
    { 
      field: 'nickname', 
      headerName: '닉네임', 
      flex: 1,
      cellRenderer: (params: any) => <span className="font-bold">{params.value}</span>
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
      cellRenderer: () => (
        <div className="flex items-center h-full">
          <Button size="icon" variant="ghost" className="h-8 w-8"><UserCog className="w-4 h-4" /></Button>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 space-y-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black">ADMIN CONSOLE</h1>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Authenticated</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onLogout}>LOGOUT</Button>
          <Button variant={sessionStatus === 'ONGOING' ? 'destructive' : 'default'} onClick={handleToggleSession}>
            {sessionStatus === 'ONGOING' ? 'STOP PARTY' : 'START PARTY'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="max-w-7xl mx-auto">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="dashboard">현황판</TabsTrigger>
          <TabsTrigger value="participants">참여자 관리</TabsTrigger>
          <TabsTrigger value="messages">쪽지 모니터링</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 text-slate-50">
              <CardHeader><CardTitle className="text-blue-400">{participants.length}</CardTitle><CardDescription>참여자 수</CardDescription></CardHeader>
            </Card>
            <Card className="bg-slate-900 border-slate-800 text-slate-50">
              <CardHeader><CardTitle className="text-green-400">{messages.length}</CardTitle><CardDescription>누적 쪽지</CardDescription></CardHeader>
            </Card>
            <Card className="bg-slate-900 border-slate-800 text-slate-50">
              <CardHeader><CardTitle className="text-red-400">{alerts.filter(a => a.type==='SOS' && !a.is_resolved).length}</CardTitle><CardDescription>미해결 SOS</CardDescription></CardHeader>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader><CardTitle>실시간 요청 (SOS / 노래)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-center py-8 text-slate-500">수신된 요청이 없습니다.</p>
              ) : (
                alerts.map(a => (
                  <div key={a.id} className={`p-4 rounded-lg border flex justify-between items-center ${a.type==='SOS' ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <div className="flex items-center gap-3">
                      {a.type === 'SOS' ? <AlertCircle className="text-red-500" /> : <Music className="text-blue-500" />}
                      <div>
                        <p className="font-bold">{a.participants?.nickname || '시스템'} : {a.message}</p>
                        <p className="text-[10px] opacity-50">{new Date(a.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {!a.is_resolved && (
                      <Button size="sm" onClick={() => supabase.from('alerts').update({ is_resolved: true }).eq('id', a.id).then(() => fetchAlerts())}>Resolve</Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-72">
              <Input 
                placeholder="닉네임으로 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border-slate-800 pr-10"
              />
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant={filterUnapplied ? "default" : "outline"} onClick={() => setFilterUnapplied(!filterUnapplied)} size="sm">
                {filterUnapplied ? "전체 보기" : "2차 미신청자만 보기"}
              </Button>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                총 {filteredParticipants.length}명
              </Badge>
            </div>
          </div>

          <div className="ag-theme-alpine-dark w-full h-[600px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <AgGridReact
              rowData={filteredParticipants}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              rowHeight={48}
              theme="legacy"
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                cellStyle: { display: 'flex', alignItems: 'center' }
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader><CardTitle>전체 쪽지 모니터링</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-center py-8 text-slate-500">발송된 쪽지가 없습니다.</p>
              ) : (
                messages.map(m => (
                  <div key={m.id} className="p-3 bg-slate-800/50 rounded border border-slate-700 flex justify-between text-xs">
                    <div>
                      <span className="text-primary font-bold">{m.sender?.nickname || '알수없음'}</span> → <span className="text-primary font-bold">{m.receiver?.nickname || '알수없음'}</span>
                      <p className="mt-1 text-slate-300">{m.content}</p>
                    </div>
                    <span className="opacity-40">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
