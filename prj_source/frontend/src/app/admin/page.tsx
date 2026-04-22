'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Square, Users, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'

// Mock Data
const initialSosRequests = [
  { id: '1', nickname: '상큼체리', message: '술이 부족해요!', createdAt: '2026-04-22 12:00', resolved: false },
  { id: '2', nickname: '젠틀맨', message: '음악이 너무 커요.', createdAt: '2026-04-22 11:45', resolved: true },
]

export default function AdminDashboard() {
  const [sessionStatus, setSessionStatus] = useState<'READY' | 'ONGOING' | 'FINISHED'>('ONGOING')
  const [sosRequests, setSosRequests] = useState(initialSosRequests)

  const handleToggleSession = () => {
    const nextStatus = sessionStatus === 'ONGOING' ? 'FINISHED' : 'ONGOING'
    setSessionStatus(nextStatus)
    toast.success(`파티 세션이 ${nextStatus === 'ONGOING' ? '시작' : '종료'}되었습니다.`)
  }

  const resolveSos = (id: string) => {
    setSosRequests(prev => prev.map(req => req.id === id ? { ...req, resolved: true } : req))
    toast.success('SOS 요청이 해결 처리되었습니다.')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Stat Cards */}
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Participants</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3">
              <Users className="text-blue-500" /> 42
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Messages Sent</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3">
              <MessageSquare className="text-green-500" /> 156
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Active SOS</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-3 text-red-500">
              <AlertCircle /> {sosRequests.filter(r => !r.resolved).length}
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
                    sos.resolved ? 'bg-slate-800/30 border-slate-800 opacity-60' : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sos.nickname}</span>
                      <span className="text-[10px] text-slate-500">{sos.createdAt}</span>
                    </div>
                    <p className="text-sm">{sos.message}</p>
                  </div>
                  {sos.resolved ? (
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
