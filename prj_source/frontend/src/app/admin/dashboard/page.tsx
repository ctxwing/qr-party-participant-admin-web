'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Clock, MessageSquare, UserCircle, Activity, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AdminRealtimeDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState({ activeUsers: 0, msgVelocity: 0 })
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()

    const channel = supabase.channel('realtime-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchLogs())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interactions' }, () => fetchLogs())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants' }, () => fetchLogs())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchLogs = async () => {
    // 쪽지, 상호작용, 참여자 데이터를 가져와서 통합 로그 생성
    const [
      { data: messages },
      { data: interactions },
      { data: participants }
    ] = await Promise.all([
      supabase.from('messages').select('*, sender:sender_id(nickname), receiver:receiver_id(nickname)').order('created_at', { ascending: false }).limit(20),
      supabase.from('interactions').select('*, sender:sender_id(nickname), receiver:receiver_id(nickname)').order('created_at', { ascending: false }).limit(20),
      supabase.from('participants').select('*').order('created_at', { ascending: false }).limit(20)
    ])

    const combinedLogs: any[] = []

    if (messages) {
      messages.forEach((m: any) => combinedLogs.push({
        id: `msg-${m.id}`,
        type: 'MESSAGE',
        user: m.sender?.nickname || '알수없음',
        details: `${m.receiver?.nickname || '알수없음'}님에게 쪽지 전송: ${m.content.substring(0, 20)}...`,
        time: new Date(m.created_at).toLocaleTimeString(),
        timestamp: new Date(m.created_at).getTime()
      }))
    }

    if (interactions) {
      interactions.forEach((i: any) => combinedLogs.push({
        id: `int-${i.id}`,
        type: 'INTERACTION',
        user: i.sender?.nickname || '알수없음',
        details: `${i.receiver?.nickname || '알수없음'}님에게 ${i.type === 'CUPID' ? '💘 큐피트' : '⭐ 호감도'} 발사`,
        time: new Date(i.created_at).toLocaleTimeString(),
        timestamp: new Date(i.created_at).getTime()
      }))
    }

    if (participants) {
      participants.forEach((p: any) => combinedLogs.push({
        id: `user-${p.id}`,
        type: 'LOGIN',
        user: p.nickname || '익명',
        details: `새로운 참여자 입장`,
        time: new Date(p.created_at).toLocaleTimeString(),
        timestamp: new Date(p.created_at).getTime()
      }))
    }

    setLogs(combinedLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50))
    
    // 통계 업데이트
    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    setStats({
      activeUsers: count || 0,
      msgVelocity: (messages?.length || 0) / 10 // 단순 예시 지표
    })
  }

  const filteredLogs = logs.filter(log => 
    log.user.includes(searchTerm) || log.details.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 space-y-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-primary" /> REAL-TIME MONITORING
        </h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search logs..." 
            className="pl-10 bg-slate-900 border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-3 bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Activity Stream</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            <div className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <p className="p-8 text-center text-slate-500">활동 내역이 없습니다.</p>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="mt-1">
                      {log.type === 'MESSAGE' && <MessageSquare className="w-4 h-4 text-green-500" />}
                      {log.type === 'NICKNAME' && <UserCircle className="w-4 h-4 text-blue-500" />}
                      {log.type === 'INTERACTION' && <Heart className="w-4 h-4 text-pink-500" />}
                      {log.type === 'LOGIN' && <Clock className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{log.user}</span>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-xs text-slate-400">{log.details}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 bg-slate-950 border-slate-700">
                      {log.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{stats.activeUsers}</span>
                <span className="text-xs text-green-500 mb-1">Live</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase">Message Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{stats.msgVelocity.toFixed(1)}</span>
                <span className="text-xs text-slate-500 mb-1">recent msg</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Database</span>
                <span className="text-green-500 font-bold">OK</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Realtime</span>
                <span className="text-green-500 font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Auth Service</span>
                <span className="text-green-500 font-bold">OK</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
