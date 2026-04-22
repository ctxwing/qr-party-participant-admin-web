'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Award, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function RankingPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRankings = async () => {
    try {
      const { data: participants } = await supabase.from('participants').select('id, nickname')
      const { data: interactions } = await supabase.from('interactions').select('receiver_id, weight')

      if (!participants) return

      const rankings = participants.map(p => {
        const score = interactions
          ?.filter(i => i.receiver_id === p.id)
          ?.reduce((acc, curr) => acc + (curr.weight || 1), 0) || 0
        return { id: p.id, nickname: p.nickname, score }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">인기 랭킹</h1>
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
            <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className={`glass border-none ${idx < 3 ? 'bg-primary/5' : ''}`}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black italic w-6 ${idx < 3 ? 'text-primary' : 'opacity-20'}`}>{idx + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{p.nickname[0]}</div>
                    <p className="font-bold">{p.nickname}</p>
                  </div>
                  <div className="flex items-center gap-1 text-like">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-bold">{p.score}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
