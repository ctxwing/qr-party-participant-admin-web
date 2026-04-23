'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ChevronLeft, Award, Heart, MessageSquare, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const CupidIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="m22 2-5 5" />
    <path d="m7 17-5 5" />
    <path d="M22 2v5" />
    <path d="M22 2h-5" />
  </svg>
)

export default function RankingPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeights, setCurrentWeights] = useState<any>({ like: 1, message: 5, cupid: 10 })
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const supabase = createClient()

  const fetchRankings = async () => {
    try {
      // 가중치 설정 가져오기
      const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'ranking_weights').maybeSingle()
      const weights = settings?.value || { like: 1, message: 5, cupid: 10 }
      setCurrentWeights(weights)

      const { data: participants } = await supabase.from('participants').select('id, nickname')
      const { data: interactions } = await supabase.from('interactions').select('receiver_id, type')
      const { data: messages } = await supabase.from('messages').select('receiver_id')

      if (!participants) return

      const rankings = participants.map(p => {
        const lCount = interactions?.filter(i => i.receiver_id === p.id && i.type === 'LIKE').length || 0
        const cCount = interactions?.filter(i => i.receiver_id === p.id && i.type === 'CUPID').length || 0
        const mCount = messages?.filter(m => m.receiver_id === p.id).length || 0

        const score = (lCount * (weights.like || 1)) +
          (mCount * (weights.message || 5)) +
          (cCount * (weights.cupid || 10))

        return { id: p.id, nickname: p.nickname, score, lCount, mCount, cCount }
      })

      setItems(rankings.sort((a, b) => b.score - a.score))
    } catch (error) {
      console.error('랭킹 집계 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRankings()
    const channel = supabase.channel('ranking-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, fetchRankings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchRankings)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">순위 집계 중...</div>

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 pt-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold">인기도 랭킹</h1>
          </div>

        </div>

        {/* Podium Area */}
        <div className="relative py-12 px-2 mb-4">
          {/* Decorative Background Glows - Stronger for Black BG */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-like/20 rounded-full blur-[100px]" />
          
          <div className="flex justify-center items-end gap-2 h-56 relative z-10">
            {/* 2nd Place */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 p-[2px] shadow-[0_0_20px_rgba(148,163,184,0.3)]">
                  <div className="w-full h-full rounded-[14px] bg-slate-900/90 flex items-center justify-center overflow-hidden relative">
                    <span className="text-3xl font-black text-slate-400 opacity-10 absolute -right-1 -bottom-2 italic">2</span>
                    <span className="text-2xl font-black text-slate-300 z-10">{items[1]?.nickname[0] || '?'}</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-slate-400 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-900 shadow-xl">2</div>
              </div>
              <div className="w-full h-24 bg-white/10 backdrop-blur-2xl rounded-2xl flex flex-col items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <p className="text-xs font-bold text-white/90 truncate w-full text-center px-2 mb-1">{items[1]?.nickname || '-'}</p>
                <span className="text-xs font-black text-slate-300">{items[1]?.score || 0}pt</span>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex-[1.2] flex flex-col items-center z-20"
            >
              <div className="relative mb-5 scale-110">
                <motion.div
                  animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-30"
                >
                  <Award className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                </motion.div>
                
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-600 p-[3px] shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                  <div className="w-full h-full rounded-[20px] bg-slate-900/90 flex items-center justify-center overflow-hidden relative border border-white/10">
                    <span className="text-5xl font-black text-yellow-400 opacity-10 absolute -right-2 -bottom-4 italic">1</span>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-amber-500 z-10">{items[0]?.nickname[0] || '?'}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-32 bg-white/15 backdrop-blur-3xl rounded-3xl flex flex-col items-center justify-center border border-white/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent" />
                <p className="text-sm font-black text-white truncate w-full text-center px-2 mb-1">{items[0]?.nickname || '-'}</p>
                <div className="bg-yellow-400 text-slate-950 px-4 py-1 rounded-full font-black text-sm shadow-lg">
                  {items[0]?.score || 0}pt
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400/30 blur-[40px] rounded-full" />
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-600 p-[2px] shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  <div className="w-full h-full rounded-[12px] bg-slate-900/90 flex items-center justify-center overflow-hidden relative">
                    <span className="text-2xl font-black text-orange-400 opacity-10 absolute -right-1 -bottom-2 italic">3</span>
                    <span className="text-xl font-black text-orange-200 z-10">{items[2]?.nickname[0] || '?'}</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900 shadow-lg">3</div>
              </div>
              <div className="w-full h-20 bg-white/10 backdrop-blur-2xl rounded-2xl flex flex-col items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <p className="text-[10px] font-bold text-white/80 truncate w-full text-center px-2 mb-0.5">{items[2]?.nickname || '-'}</p>
                <span className="text-xs font-black text-orange-300">{items[2]?.score || 0}pt</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scoring Criteria Legend */}
        <div className="mx-2 mb-10 relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-3xl" />
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Point Rules</p>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-like/20 flex items-center justify-center border border-like/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <Heart className="w-6 h-6 text-like fill-current" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-like">+{currentWeights.like}</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase mt-1">Like</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <MessageSquare className="w-6 h-6 text-blue-400 fill-current" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-blue-400">+{currentWeights.message}</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase mt-1">Talk</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <CupidIcon className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-yellow-500">+{currentWeights.cupid}</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase mt-1">Match</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {items.map((p, idx) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedParticipant({ ...p, rank: idx + 1 })}
              className="cursor-pointer active:scale-95 transition-transform"
            >
              <Card className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg hover:bg-white/[0.08] transition-all duration-300 ${idx < 3 ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black italic w-6 ${idx < 3 ? 'text-primary' : 'opacity-20'}`}>{idx + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{p.nickname[0]}</div>
                    <p className="font-bold">{p.nickname}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-lg font-black">{p.score}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-80">
                      <span className="flex items-center gap-1 text-like"><Heart className="w-3.5 h-3.5 fill-current" /> {p.lCount}</span>
                      <span className="flex items-center gap-1 text-blue-400"><MessageSquare className="w-3.5 h-3.5" /> {p.mCount}</span>
                      <span className="flex items-center gap-1 text-yellow-500"><CupidIcon className="w-3.5 h-3.5" /> {p.cCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 참여자 상세 정보 팝업 */}
      <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
        <DialogContent className="max-w-[90vw] rounded-2xl border-none glass bg-background/80 backdrop-blur-xl">
          <DialogHeader className="items-center pb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
              <span className="text-3xl font-black text-primary">{selectedParticipant?.nickname[0]}</span>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-background font-black text-sm">
                {selectedParticipant?.rank}
              </div>
            </div>
            <DialogTitle className="text-2xl font-black">{selectedParticipant?.nickname}</DialogTitle>
            <DialogDescription className="text-primary font-bold">인기 랭킹 {selectedParticipant?.rank}위</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <div className="bg-primary/5 rounded-xl p-4 flex flex-col items-center gap-1">
              <Star className="w-5 h-5 text-primary fill-current" />
              <p className="text-[10px] opacity-50 font-bold uppercase">Popularity Score</p>
              <p className="text-2xl font-black">{selectedParticipant?.score}</p>
            </div>
            <div className="bg-like/5 rounded-xl p-4 flex flex-col items-center gap-1">
              <Heart className="w-5 h-5 text-like fill-current" />
              <p className="text-[10px] opacity-50 font-bold uppercase">Likes Received</p>
              <p className="text-2xl font-black">{selectedParticipant?.lCount}</p>
            </div>
            <div className="bg-blue-500/5 rounded-xl p-4 flex flex-col items-center gap-1">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <p className="text-[10px] opacity-50 font-bold uppercase">Messages</p>
              <p className="text-2xl font-black">{selectedParticipant?.mCount}</p>
            </div>
            <div className="bg-yellow-500/5 rounded-xl p-4 flex flex-col items-center gap-1">
              <CupidIcon className="w-5 h-5 text-yellow-500" />
              <p className="text-[10px] opacity-50 font-bold uppercase">Cupid Matches</p>
              <p className="text-2xl font-black">{selectedParticipant?.cCount}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1 h-12 rounded-xl font-bold" onClick={() => setSelectedParticipant(null)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
