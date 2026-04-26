'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Play, Square, Settings2 } from 'lucide-react'
import { GuideFlow } from "@/components/admin/guide-flow"
import { DashboardTab } from '@/components/admin/DashboardTab'
import { AnnouncementsTab } from '@/components/admin/AnnouncementsTab'
import { ParticipantsTab } from '@/components/admin/ParticipantsTab'
import { MessagesTab } from '@/components/admin/MessagesTab'
import { SettingsTab } from '@/components/admin/SettingsTab'
import { useAdminData } from '@/hooks/useAdminData'

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
  const { data: session } = useSession()

  const {
    sessionStatus, handleToggleSession,
    participants, handleUpdateCount, handleToggleApply,
    messages, fetchMessages,
    alerts, fetchAlerts, handleToggleResolve,
  } = useAdminData(session?.user?.id)

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-8 relative overflow-hidden">
      <div className="premium-blur-bg opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <GuideFlow currentStep={sessionStatus === 'ONGOING' ? 'start' : sessionStatus === 'FINISHED' ? 'finish' : 'create'} />
      </div>
      
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
            <TabsTrigger value="announcements" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">실시간 공지</TabsTrigger>
            <TabsTrigger value="participants" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">참여자 관리</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">참여자간 쪽지</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-6 md:px-10 py-2 md:py-3 data-[state=active]:bg-vibrant-gradient data-[state=active]:text-white data-[state=active]:shadow-lg text-sm md:text-lg font-bold transition-all hover:bg-white/5">시스템 설정</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <DashboardTab
            participants={participants}
            messages={messages}
            alerts={alerts}
            fetchAlerts={fetchAlerts}
            handleToggleResolve={handleToggleResolve}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab />
        </TabsContent>

        <TabsContent value="participants">
          <ParticipantsTab
            participants={participants}
            handleUpdateCount={handleUpdateCount}
            handleToggleApply={handleToggleApply}
          />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab
            messages={messages}
            fetchMessages={fetchMessages}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
