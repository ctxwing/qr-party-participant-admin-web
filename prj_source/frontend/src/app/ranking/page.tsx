"use client";

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ChevronLeft, Award, Heart, MessageSquare, Star, Trophy, Crown, Medal } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useStore } from '@/store/useStore'

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
  const { participant } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeights, setCurrentWeights] = useState<any>({ like: 1, message: 5, cupid: 10 })
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [partyInfo, setPartyInfo] = useState<any>(null)
  const supabase = createClient()

  const fetchRankings = async () => {
    try {
      const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'ranking_weights').maybeSingle()
      const weights = settings?.value || { like: 1, message: 5, cupid: 10 }
      setCurrentWeights(weights)

      if (participant?.id) {
        const { data: me } = await supabase.from('participants').select('party_id').eq('id', participant.id).single()
        if (me?.party_id) {
          const { data: party } = await supabase.from('parties').select('*').eq('id', me.party_id).single()
          if (party) setPartyInfo(party)
        }
      }

      const { data: participantsList } = await supabase.from('participants').select('id, nickname')
      const { data: interactions } = await supabase.from('interactions').select('receiver_id, type')
      const { data: messages } = await supabase.from('messages').select('receiver_id')

      if (!participantsList) return

      const rankings = participantsList.map(p => {
        const lCount = interactions?.filter(i => i.receiver_id === p.id && i.type === 'heart').length || 0
        const cCount = interactions?.filter(i => i.receiver_id === p.id && i.type === 'cupid').length || 0
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

  // 내 순위 정보 추출
  const myRank = useMemo(() => {
    if (!participant?.id) return null;
    const index = items.findIndex(item => item.id === participant.id);
    return index !== -1 ? { ...items[index], rank: index + 1 } : null;
  }, [items, participant?.id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-bold text-white">데이터 집계 중...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-md space-y-8 pt-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Hall &nbsp;of &nbsp; Fame</h1>
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Real-time Popularity Ranking</p>
              {partyInfo && (
                <>
                  <p className="text-emerald-400 text-xs font-bold tracking-widest mt-1">{partyInfo.name}</p>
                  {(partyInfo.start_at || partyInfo.end_at) && (
                    <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest">
                      {partyInfo.start_at ? new Date(partyInfo.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''} ~ {partyInfo.end_at ? new Date(partyInfo.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Podium (Top 3) */}
        <div className="relative py-12 px-2">
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-[100px]" />
          
          <div className="flex justify-center items-end gap-3 h-56 relative z-10">
            {/* 2위 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-400/20 border border-slate-400/30 flex items-center justify-center mb-3 relative">
                <span className="text-2xl font-bold text-slate-400">{items[1]?.nickname?.[0] || '?'}</span>
                <Medal className="absolute -top-3 -right-3 w-8 h-8 text-slate-400 drop-shadow-lg" />
              </div>
              <div className="w-full h-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <p className="text-xs font-bold truncate px-2">{items[1]?.nickname || '-'}</p>
                <p className="text-sm font-black text-slate-400">{items[1]?.score || 0}pt</p>
              </div>
            </div>

            {/* 1위 */}
            <div className="flex-[1.2] flex flex-col items-center z-10 scale-110">
              <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border-2 border-amber-400/50 flex items-center justify-center mb-4 relative shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                <span className="text-3xl font-black text-amber-400">{items[0]?.nickname?.[0] || '?'}</span>
                <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-amber-400 drop-shadow-xl animate-bounce" />
              </div>
              <div className="w-full h-32 bg-amber-400/10 rounded-3xl border border-amber-400/30 flex flex-col items-center justify-center shadow-2xl">
                <p className="text-sm font-black truncate px-2">{items[0]?.nickname || '-'}</p>
                <p className="text-lg font-black text-amber-400">{items[0]?.score || 0}pt</p>
              </div>
            </div>

            {/* 3위 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-800/20 border border-orange-800/40 flex items-center justify-center mb-2 relative">
                <span className="text-xl font-bold text-orange-400">{items[2]?.nickname?.[0] || '?'}</span>
                <Medal className="absolute -top-2 -right-2 w-7 h-7 text-orange-800 drop-shadow-lg" />
              </div>
              <div className="w-full h-20 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold truncate px-2">{items[2]?.nickname || '-'}</p>
                <p className="text-xs font-black text-orange-400">{items[2]?.score || 0}pt</p>
              </div>
            </div>
          </div>
        </div>

        {/* 랭킹 리스트 (본인 강조 포함) */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Overall Standings</h2>
          {items.map((p, idx) => {
            const isMe = p.id === participant?.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                  isMe 
                    ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)] ring-1 ring-indigo-500/50" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
                onClick={() => setSelectedParticipant({ ...p, rank: idx + 1 })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black italic w-6 ${idx < 3 ? "text-amber-400" : "text-zinc-600"}`}>
                      {idx + 1}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isMe ? "bg-indigo-500 text-white" : "bg-white/10 text-zinc-400"}`}>
                      {p.nickname?.[0] || '?'}
                    </div>
                    <div>
                      <p className={`font-bold ${isMe ? "text-indigo-400" : "text-white"}`}>
                        {p.nickname} {isMe && <span className="ml-1 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase">Me</span>}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">{p.score} PT</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center opacity-40">
                      <Heart className="w-3 h-3 text-rose-500 mb-1" />
                      <span className="text-[9px] font-bold">{p.lCount}</span>
                    </div>
                    <div className="flex flex-col items-center opacity-40">
                      <MessageSquare className="w-3 h-3 text-indigo-400 mb-1" />
                      <span className="text-[9px] font-bold">{p.mCount}</span>
                    </div>
                    <div className="flex flex-col items-center opacity-40">
                      <CupidIcon className="w-3 h-3 text-amber-500 mb-1" />
                      <span className="text-[9px] font-bold">{p.cCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 하단: 내 순위 고정 요약 (T026 고도화) */}
      {myRank && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-indigo-500/30 z-30">
          <div className="max-w-md mx-auto flex items-center justify-between bg-indigo-600 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">My Current Rank</p>
                <p className="text-lg font-black text-white">{myRank.rank}위 <span className="text-sm font-normal opacity-80">({myRank.score}pt)</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Top Percent</p>
              <p className="text-lg font-black text-white">{Math.round((myRank.rank / items.length) * 100)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 상세 팝업 생략 (기존 것 유지) */}
    </div>
  );
}
