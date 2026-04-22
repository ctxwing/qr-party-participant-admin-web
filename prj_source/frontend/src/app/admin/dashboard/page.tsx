'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Clock, MessageSquare, UserCircle, Activity } from 'lucide-react'

// Mock Logs
const activityLogs = [
  { id: 1, type: 'NICKNAME', user: '상큼체리', details: '상큼체리 -> 달콤체리 변경', time: '12:05:22' },
  { id: 2, type: 'MESSAGE', user: '젠틀맨', details: '춤추는곰님에게 쪽지 전송', time: '12:04:10' },
  { id: 3, type: 'INTERACTION', user: '미소천사', details: '상큼체리님에게 큐피트 발사', time: '12:03:45' },
  { id: 4, type: 'LOGIN', user: '뉴페이스', details: '새로운 참여자 입장', time: '12:02:15' },
]

export default function AdminRealtimeDashboard() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = activityLogs.filter(log => 
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
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="mt-1">
                    {log.type === 'MESSAGE' && <MessageSquare className="w-4 h-4 text-green-500" />}
                    {log.type === 'NICKNAME' && <UserCircle className="w-4 h-4 text-blue-500" />}
                    {log.type === 'INTERACTION' && <Activity className="w-4 h-4 text-pink-500" />}
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
              ))}
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
                <span className="text-3xl font-bold">128</span>
                <span className="text-xs text-green-500 mb-1">+12%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase">Message Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">4.2</span>
                <span className="text-xs text-slate-500 mb-1">msg / min</span>
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
