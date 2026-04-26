'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import {
  X, ArrowLeft, LogOut,
  Edit2, MessageCircle, Heart, Zap, Music,
  AlertTriangle, Megaphone, History
} from 'lucide-react'

type Panel = 'menu' | 'nickname' | 'messages' | 'hearts' | 'cupids' | 'music' | 'sos' | 'announcements'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  participantId: string
}

interface SidebarData {
  nicknameHistory: any[]
  messages: any[]
  hearts: any[]
  cupids: any[]
  musicAlerts: any[]
  sosAlerts: any[]
  announcements: any[]
}

const MENU_ITEMS: { key: Panel; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'nickname', label: '닉네임 변경 이력', icon: History, color: 'text-indigo-400' },
  { key: 'messages', label: '수신 쪽지', icon: MessageCircle, color: 'text-blue-400' },
  { key: 'hearts', label: '수신 호감', icon: Heart, color: 'text-rose-400' },
  { key: 'cupids', label: '수신 큐피트', icon: Zap, color: 'text-amber-400' },
  { key: 'music', label: '음악 신청 이력', icon: Music, color: 'text-cyan-400' },
  { key: 'sos', label: 'SOS 신청 이력', icon: AlertTriangle, color: 'text-rose-500' },
  { key: 'announcements', label: '수신 전체 공지', icon: Megaphone, color: 'text-purple-400' },
]

export function DashboardSidebar({ isOpen, onClose, participantId }: DashboardSidebarProps) {
  const [panel, setPanel] = useState<Panel>('menu')
  const [data, setData] = useState<SidebarData>({
    nicknameHistory: [], messages: [], hearts: [], cupids: [],
    musicAlerts: [], sosAlerts: [], announcements: []
  })
  const { setParticipant } = useStore()
  const router = useRouter()
  const supabase = createClient()

  const fetchSidebarData = useCallback(async () => {
    if (!participantId) return
    const [
      histRes, msgRes, heartRes, cupidRes,
      musicRes, sosRes, annRes
    ] = await Promise.all([
      supabase.from('nickname_history').select('*').eq('participant_id', participantId).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('receiver_id', participantId).order('created_at', { ascending: false }),
      supabase.from('interactions').select('*, sender:participants!interactions_sender_id_fkey(nickname)').eq('receiver_id', participantId).eq('type', 'heart').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*, sender:participants!interactions_sender_id_fkey(nickname)').eq('receiver_id', participantId).eq('type', 'cupid').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').eq('participant_id', participantId).eq('type', 'MUSIC').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').eq('participant_id', participantId).eq('type', 'SOS').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(30),
    ])

    setData({
      nicknameHistory: histRes.data || [],
      messages: msgRes.data || [],
      hearts: heartRes.data || [],
      cupids: cupidRes.data || [],
      musicAlerts: musicRes.data || [],
      sosAlerts: sosRes.data || [],
      announcements: annRes.data || [],
    })
  }, [participantId, supabase])

  useEffect(() => {
    if (isOpen && participantId) {
      setPanel('menu')
      fetchSidebarData()
    }
  }, [isOpen, participantId, fetchSidebarData])

  const handleLogout = () => {
    setParticipant(null)
    router.push('/setup')
    onClose()
  }

  const goBack = () => setPanel('menu')

  const panelTitle: Record<Panel, string> = {
    menu: '내 정보',
    nickname: '닉네임 변경 이력',
    messages: '수신 쪽지',
    hearts: '수신 호감',
    cupids: '수신 큐피트',
    music: '음악 신청 이력',
    sos: 'SOS 신청 이력',
    announcements: '수신 전체 공지',
  }

  const renderPanelContent = () => {
    switch (panel) {
      case 'nickname':
        return data.nicknameHistory.length === 0 ? (
          <EmptyState text="변경 이력이 없습니다" />
        ) : (
          <div className="space-y-2">
            {data.nicknameHistory.map((h: any) => (
              <div key={h.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-500 line-through">{h.old_nickname}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-indigo-400 font-bold">{h.new_nickname}</span>
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {new Date(h.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        )

      case 'messages':
        return data.messages.length === 0 ? (
          <EmptyState text="받은 쪽지가 없습니다" icon={<MessageCircle />} />
        ) : (
          <div className="space-y-2">
            {data.messages.map((m: any) => (
              <div key={m.id} className={`p-3 rounded-xl border ${m.is_read ? 'bg-white/5 border-white/5' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">익명 쪽지</span>
                  <span className="text-[10px] text-zinc-500">{new Date(m.created_at).toLocaleTimeString('ko-KR')}</span>
                </div>
                <p className="text-sm leading-relaxed">{m.content}</p>
                {!m.is_read && <Badge className="mt-1 text-[8px] bg-indigo-500/20 text-indigo-400">NEW</Badge>}
              </div>
            ))}
          </div>
        )

      case 'hearts':
        return data.hearts.length === 0 ? (
          <EmptyState text="받은 호감이 없습니다" icon={<Heart />} />
        ) : (
          <div className="space-y-2">
            {data.hearts.map((h: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{h.sender?.nickname || '익명'}님의 호감</p>
                  <p className="text-[10px] text-zinc-500">{new Date(h.created_at).toLocaleString('ko-KR')}</p>
                </div>
              </div>
            ))}
          </div>
        )

      case 'cupids':
        return data.cupids.length === 0 ? (
          <EmptyState text="받은 큐피트가 없습니다" icon={<Zap />} />
        ) : (
          <div className="space-y-2">
            {data.cupids.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{c.sender?.nickname || '익명'}님의 큐피트</p>
                  <p className="text-[10px] text-zinc-500">{new Date(c.created_at).toLocaleString('ko-KR')}</p>
                </div>
              </div>
            ))}
          </div>
        )

      case 'music':
        return data.musicAlerts.length === 0 ? (
          <EmptyState text="음악 신청 이력이 없습니다" icon={<Music />} />
        ) : (
          <div className="space-y-2">
            {data.musicAlerts.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-sm">{a.message?.replace(/^🎵 노래신청 \([^)]+\):\s*/, '')}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-zinc-500">{new Date(a.created_at).toLocaleString('ko-KR')}</span>
                  <Badge variant={a.resolved ? 'default' : 'secondary'} className="text-[8px]">
                    {a.resolved ? '처리완료' : '대기중'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )

      case 'sos':
        return data.sosAlerts.length === 0 ? (
          <EmptyState text="SOS 신청 이력이 없습니다" icon={<AlertTriangle />} />
        ) : (
          <div className="space-y-2">
            {data.sosAlerts.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <p className="text-sm">{a.message?.replace(/^🚨 SOS \([^)]+\):\s*/, '')}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-zinc-500">{new Date(a.created_at).toLocaleString('ko-KR')}</span>
                  <Badge variant={a.resolved ? 'default' : 'destructive'} className="text-[8px]">
                    {a.resolved ? '해결됨' : '처리중'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )

      case 'announcements':
        return data.announcements.length === 0 ? (
          <EmptyState text="수신된 공지가 없습니다" icon={<Megaphone />} />
        ) : (
          <div className="space-y-2">
            {data.announcements.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className="text-[8px] capitalize">{a.type}</Badge>
                  <span className="text-[10px] text-zinc-500">{new Date(a.created_at).toLocaleTimeString('ko-KR')}</span>
                </div>
                <p className="text-sm leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-zinc-950 border-l border-white/10 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                {panel !== 'menu' && (
                  <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full hover:bg-white/10 h-8 w-8">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <h2 className="text-lg font-black tracking-tight">{panelTitle[panel]}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {panel === 'menu' ? (
                <div className="space-y-2">
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon
                    const count = (() => {
                      switch (item.key) {
                        case 'nickname': return data.nicknameHistory.length
                        case 'messages': return data.messages.filter((m: any) => !m.is_read).length
                        case 'hearts': return data.hearts.length
                        case 'cupids': return data.cupids.length
                        case 'music': return data.musicAlerts.length
                        case 'sos': return data.sosAlerts.length
                        case 'announcements': return data.announcements.length
                        default: return 0
                      }
                    })()
                    return (
                      <button
                        key={item.key}
                        onClick={() => setPanel(item.key)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all border border-white/5"
                      >
                        <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
                        <span className="flex-1 text-left text-sm font-bold">{item.label}</span>
                        {count > 0 && (
                          <Badge className="text-[10px] bg-white/10 text-white/60 border-white/10">
                            {count}
                          </Badge>
                        )}
                      </button>
                    )
                  })}

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] transition-all border border-rose-500/20"
                    >
                      <LogOut className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="flex-1 text-left text-sm font-bold text-rose-400">나가기</span>
                    </button>
                  </div>
                </div>
              ) : (
                renderPanelContent()
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function EmptyState({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-30">
      {icon && <div className="w-12 h-12 mb-3">{icon}</div>}
      <p className="text-sm">{text}</p>
    </div>
  )
}
