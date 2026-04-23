'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, MessageSquare, UserCircle, Activity, Heart, ShieldCheck, Zap } from 'lucide-react'
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
    
    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true })
    setStats({
      activeUsers: count || 0,
      msgVelocity: (messages?.length || 0) / 10
    })
  }

  const filteredLogs = logs.filter(log => 
    log.user.includes(searchTerm) || log.details.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6 relative overflow-hidden">
      <div className="premium-blur-bg opacity-30" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-vibrant-gradient shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Real-time Stream</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Live System Monitoring</p>
          </div>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="활동 로그 검색..." 
            className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Activity Feed */}
        <Card className="lg:col-span-3 glass border-none shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              Live Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[750px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <Activity className="w-12 h-12 text-white/5 mx-auto" />
                  <p className="text-sm font-bold text-white/20 uppercase tracking-widest">활동 내역이 없습니다.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-5 flex items-start gap-5 hover:bg-white/5 transition-all group">
                    <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      {log.type === 'MESSAGE' && <MessageSquare className="w-4 h-4 text-green-400 text-glow" />}
                      {log.type === 'INTERACTION' && <Heart className="w-4 h-4 text-pink-400 text-glow" />}
                      {log.type === 'LOGIN' && <Zap className="w-4 h-4 text-primary text-glow" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-white group-hover:text-primary transition-colors">{log.user}</span>
                        <span className="text-[10px] font-bold text-white/20">{log.time}</span>
                      </div>
                      <p className="text-sm text-white/50 font-medium leading-relaxed">{log.details}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-tighter text-white/30">
                      {log.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Quick Stats */}
        <div className="space-y-6">
          <Card className="glass border-none shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white text-glow">{stats.activeUsers}</span>
                <div className="flex items-center gap-1 text-green-500 font-black text-[10px] mb-2 uppercase animate-pulse">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Live
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Msg Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-blue-400 text-glow">{stats.msgVelocity.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-white/20 mb-2 uppercase">Recent Activity</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-vibrant-gradient" />
            <CardHeader className="pb-2 bg-white/5">
              <CardTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-primary" />
                System Integrity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-white/40">Database Engine</span>
                <span className="text-green-500 text-glow">Operational</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-white/40">Realtime Socket</span>
                <span className="text-green-500 text-glow">Active</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-white/40">Auth Gateway</span>
                <span className="text-green-500 text-glow">Secure</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
