'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Bell, BellOff, CheckCircle, Clock, ShieldAlert, Zap } from 'lucide-react'
import { toast } from 'sonner'

// Mock SOS Data
const initialAlerts = [
  { id: '1', user: '상큼체리', message: '도움이 필요해요! 술이 쏟아졌어요.', time: '12:10:05', status: 'PENDING' },
  { id: '2', user: '젠틀맨', message: '너무 시끄러워서 자리를 옮기고 싶어요.', time: '12:08:30', status: 'PENDING' },
]

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const playAlertSound = () => {
    if (!soundEnabled) return
    const audio = new Audio('/alert-chime.mp3')
    audio.play().catch(() => console.log('Audio play blocked by browser policy'))
  }

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a))
    toast.success('알림이 해결 처리되었습니다.')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-8 relative overflow-hidden">
      <div className="premium-blur-bg" />
      
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative p-3 rounded-2xl bg-sos shadow-[0_0_20px_rgba(255,0,0,0.3)]">
            <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping opacity-75"></span>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">SOS Emergency</h1>
            <p className="text-[10px] font-bold text-sos uppercase tracking-[0.4em] animate-pulse">Critical Priority Queue</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-12 px-6 glass border-white/10 hover:bg-white/5 gap-2 rounded-xl"
        >
          {soundEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-white/30" />}
          <span className="font-bold uppercase tracking-widest text-xs">{soundEnabled ? 'Alert Sound ON' : 'Alert Sound Muted'}</span>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {alerts.filter(a => a.status === 'PENDING').length === 0 && (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-xl font-black text-white/20 uppercase tracking-widest">No Active Emergencies</p>
            <p className="text-xs text-white/10 font-bold uppercase tracking-widest">System is running smooth</p>
          </div>
        )}

        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-none transition-all duration-700 shadow-2xl overflow-hidden ${
              alert.status === 'RESOLVED' 
                ? 'glass opacity-30 grayscale' 
                : 'bg-sos/10 ring-1 ring-sos/50 animate-in fade-in slide-in-from-right duration-500 shadow-[0_0_50px_rgba(255,0,0,0.1)]'
            }`}
          >
            <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.status === 'RESOLVED' ? 'bg-white/20' : 'bg-sos animate-pulse'}`} />
            <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-lg bg-sos text-[10px] font-black text-white shadow-lg animate-pulse">
                    URGENT
                  </div>
                  <span className="text-2xl font-black text-white">{alert.user}</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-white/40">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </div>
                </div>
                <p className="text-white/80 text-xl font-medium leading-tight tracking-tight">{alert.message}</p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {alert.status === 'PENDING' ? (
                  <Button 
                    className="bg-vibrant-gradient hover:scale-105 active:scale-95 transition-all font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 border-t border-white/20 text-lg"
                    onClick={() => handleResolve(alert.id)}
                  >
                    RESOLVE NOW
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-6 py-3 rounded-2xl glass border-white/10">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black text-primary uppercase tracking-widest">Resolved</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
