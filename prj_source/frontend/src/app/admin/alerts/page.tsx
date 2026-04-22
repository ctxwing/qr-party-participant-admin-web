'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Bell, BellOff, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

// Mock SOS Data
const initialAlerts = [
  { id: '1', user: '상큼체리', message: '도움이 필요해요! 술이 쏟아졌어요.', time: '12:10:05', status: 'PENDING' },
  { id: '2', user: '젠틀맨', message: '너무 시끄러워서 자리를 옮기고 싶어요.', time: '12:08:30', status: 'PENDING' },
]

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // SOS 발생 시 효과음 재생 시뮬레이션
  const playAlertSound = () => {
    if (!soundEnabled) return
    const audio = new Audio('/alert-chime.mp3') // 실제 파일은 없으나 경로 설정
    audio.play().catch(() => console.log('Audio play blocked by browser policy'))
  }

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a))
    toast.success('알림이 해결 처리되었습니다.')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <h1 className="text-3xl font-black">SOS EMERGENCY QUEUE</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
        >
          {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {soundEnabled ? 'Sound ON' : 'Muted'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {alerts.filter(a => a.status === 'PENDING').length === 0 && (
          <div className="text-center py-20 opacity-30">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-bold">현재 활성화된 SOS가 없습니다.</p>
          </div>
        )}

        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-none transition-all duration-500 ${
              alert.status === 'RESOLVED' 
                ? 'bg-zinc-900/50 opacity-40 scale-95' 
                : 'bg-red-950/20 ring-1 ring-red-500/50 animate-in fade-in slide-in-from-right'
            }`}
          >
            <CardContent className="p-6 flex justify-between items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-600 hover:bg-red-600 font-black">URGENT</Badge>
                  <span className="text-lg font-bold">{alert.user}</span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </span>
                </div>
                <p className="text-zinc-300 text-lg leading-tight">{alert.message}</p>
              </div>
              <div className="flex flex-col gap-2">
                {alert.status === 'PENDING' ? (
                  <Button 
                    className="bg-green-600 hover:bg-green-500 font-bold px-8 h-12 rounded-xl"
                    onClick={() => handleResolve(alert.id)}
                  >
                    RESOLVE
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-green-500 border-green-500 px-6 py-2">
                    DONE
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
