'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ChevronLeft, Award, Heart, MessageSquare, Star, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'

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
            <h1 className="text-3xl font-bold">인기 랭킹</h1>
          </div>
          
          {/* 랭킹 기준 뱃지 */}
          <div className="flex flex-wrap gap-2 px-2">
            <Badge variant="outline" className="bg-like/5 text-like border-like/20 py-1">
              <Heart className="w-3 h-3 mr-1 fill-current" /> 좋아요 +{currentWeights.like}
            </Badge>
            <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 py-1">
              <MessageSquare className="w-3 h-3 mr-1" /> 쪽지 +{currentWeights.message}
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/5 text-yellow-500 border-yellow-500/20 py-1">
              <Award className="w-3 h-3 mr-1" /> 큐피트 +{currentWeights.cupid}
            </Badge>
          </div>
        </div>

        {/* Podium Area */}
        <div className="flex justify-center items-end gap-2 h-44 pt-4">
          {/* 2위 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center border-2 border-slate-400 font-bold">2</div>
            <div className="w-20 h-16 bg-slate-400/20 rounded-t-lg flex items-center justify-center px-1">
              <p className="text-[10px] font-bold truncate">{items[1]?.nickname || '-'}</p>
            </div>
          </div>
          {/* 1위 */}
          <div className="flex flex-col items-center gap-1">
            <Award className="w-6 h-6 text-yellow-500 animate-bounce" />
            <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-yellow-600 shadow-xl font-bold text-white text-xl">1</div>
            <div className="w-24 h-24 bg-yellow-600/20 rounded-t-lg flex items-center justify-center px-1 border-t-2 border-yellow-500/50">
              <p className="text-xs font-bold truncate">{items[0]?.nickname || '-'}</p>
            </div>
          </div>
          {/* 3위 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center border-2 border-orange-500 font-bold">3</div>
            <div className="w-20 h-12 bg-orange-500/20 rounded-t-lg flex items-center justify-center px-1">
              <p className="text-[10px] font-bold truncate">{items[2]?.nickname || '-'}</p>
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
              <Card className={`glass border-none ${idx < 3 ? 'bg-primary/5' : ''}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black italic w-6 ${idx < 3 ? 'text-primary' : 'opacity-20'}`}>{idx + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{p.nickname[0]}</div>
                    <p className="font-bold">{p.nickname}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-primary">
                      <Award className="w-4 h-4" />
                      <span className="text-lg font-black">{p.score}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-40">
                      <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 fill-current" /> {p.lCount}</span>
                      <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" /> {p.mCount}</span>
                      <span className="flex items-center gap-0.5"><Award className="w-2.5 h-2.5" /> {p.cCount}</span>
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
              <Zap className="w-5 h-5 text-yellow-500 fill-current" />
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
