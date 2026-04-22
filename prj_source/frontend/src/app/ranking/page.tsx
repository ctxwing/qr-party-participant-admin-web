'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Reorder } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Award, Heart } from 'lucide-react'

// Mock Data
const initialRankings = [
  { id: '1', nickname: '상큼체리', score: 1250 },
  { id: '2', nickname: '젠틀맨', score: 980 },
  { id: '4', nickname: '미소천사', score: 850 },
  { id: '3', nickname: '춤추는곰', score: 420 },
]

export default function RankingPage() {
  const router = useRouter()
  const [items, setItems] = useState(initialRankings)

  // 실시간 순위 변동 시뮬레이션 (T014에서 실제 연동 예정)
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev]
        const idx = Math.floor(Math.random() * next.length)
        next[idx] = { ...next[idx], score: next[idx].score + Math.floor(Math.random() * 50) }
        return next.sort((a, b) => b.score - a.score)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 pt-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">인기 랭킹</h1>
        </div>

        {/* Top 3 Podium (Visual Focus) */}
        <div className="flex justify-center items-end gap-2 h-40 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center border-4 border-slate-400">
              <span className="text-2xl font-bold">2</span>
            </div>
            <div className="w-20 h-16 bg-slate-400/50 rounded-t-lg flex items-center justify-center">
              <p className="text-[10px] font-bold truncate px-1">{items[1]?.nickname}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Award className="w-8 h-8 text-yellow-500 animate-bounce" />
            <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
              <span className="text-3xl font-bold">1</span>
            </div>
            <div className="w-24 h-24 bg-yellow-600/50 rounded-t-lg flex items-center justify-center">
              <p className="text-xs font-bold truncate px-1">{items[0]?.nickname}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center border-4 border-orange-500">
              <span className="text-2xl font-bold">3</span>
            </div>
            <div className="w-20 h-12 bg-orange-500/50 rounded-t-lg flex items-center justify-center">
              <p className="text-[10px] font-bold truncate px-1">{items[2]?.nickname}</p>
            </div>
          </div>
        </div>

        {/* Full List with Motion */}
        <div className="space-y-3 mt-8">
          {items.map((p, index) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass border-none overflow-hidden">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black italic opacity-20 w-6">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {p.nickname[0]}
                    </div>
                    <div>
                      <p className="font-bold">{p.nickname}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Participant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-like">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-bold">{p.score.toLocaleString()}</span>
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
