'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Users, UserCog, History, Music, AlertCircle, MessageSquare, ShieldCheck, Calendar, Fingerprint, ArrowRight } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { defaultColDef, AG_GRID_THEME } from '@/lib/ag-grid-setup'
import { formatDate } from '@/lib/admin-utils'
import { createClient } from '@/lib/supabase'

interface ParticipantsTabProps {
  participants: any[]
  handleUpdateCount: (id: string, field: string, value: number) => void
  handleToggleApply: (id: string, field: string, current: boolean) => void
}

export function ParticipantsTab({ participants, handleUpdateCount, handleToggleApply }: ParticipantsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUnapplied, setFilterUnapplied] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [participantStats, setParticipantStats] = useState<any>({ received: 0, sent: 0, songs: 0, sos: 0 })
  const [nicknameHistory, setNicknameHistory] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (selectedParticipant) {
      fetchParticipantDetails(selectedParticipant.id)
    }
  }, [selectedParticipant])

  const fetchParticipantDetails = async (id: string) => {
    const [received, sent, alertData, history] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', id),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', id),
      supabase.from('alerts').select('type').eq('participant_id', id),
      supabase.from('nickname_history').select('*').eq('participant_id', id).order('created_at', { ascending: false })
    ])
    setParticipantStats({
      received: received.count || 0,
      sent: sent.count || 0,
      songs: alertData.data?.filter(a => a.type === 'MUSIC').length || 0,
      sos: alertData.data?.filter(a => a.type === 'SOS').length || 0
    })
    setNicknameHistory(history.data || [])
  }

  const filteredParticipants = participants.filter(p => {
    const matchesFilter = filterUnapplied ? !p.is_second_applied : true
    const matchesSearch = p.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const columnDefs: ColDef[] = [
    {
      field: 'nickname',
      headerName: '닉네임',
      flex: 1,
      cellRenderer: (params: any) => <span className="font-bold">{params.value}</span>
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      cellRenderer: (params: any) => <span className="text-[10px] opacity-30 font-mono">{params.value.split('-')[0]}</span>,
      filter: false
    },
    {
      field: 'created_at',
      headerName: '가입일',
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'last_participated_at',
      headerName: '참여일',
      width: 150,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'is_first_applied',
      headerName: '1차',
      width: 80,
      cellRenderer: (params: any) => (
        <Badge
          onClick={() => handleToggleApply(params.data.id, 'is_first_applied', params.value)}
          className="cursor-pointer"
          variant={params.value ? 'default' : 'secondary'}
        >
          {params.value ? 'O' : 'X'}
        </Badge>
      )
    },
    {
      field: 'is_second_applied',
      headerName: '2차',
      width: 80,
      cellRenderer: (params: any) => (
        <Badge
          onClick={() => handleToggleApply(params.data.id, 'is_second_applied', params.value)}
          className="cursor-pointer"
          variant={params.value ? 'default' : 'secondary'}
        >
          {params.value ? 'O' : 'X'}
        </Badge>
      )
    },
    {
      field: 'cupid_count',
      headerName: '큐피트',
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 h-full">
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'cupid_count', (params.value || 0) - 1)}>-</button>
          <span className="w-4 text-center">{params.value || 0}</span>
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'cupid_count', (params.value || 0) + 1)}>+</button>
        </div>
      )
    },
    {
      field: 'like_count',
      headerName: '호감도',
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2 h-full">
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'like_count', (params.value || 0) - 1)}>-</button>
          <span className="w-4 text-center">{params.value || 0}</span>
          <button className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700" onClick={() => handleUpdateCount(params.data.id, 'like_count', (params.value || 0) + 1)}>+</button>
        </div>
      )
    },
    {
      headerName: '액션',
      width: 80,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-blue-500/20 text-blue-400"
            onClick={() => setSelectedParticipant(params.data)}
          >
            <UserCog className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="glass border-none shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Input
                placeholder="참여자 닉네임 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 h-12 pl-10 focus:ring-primary/20"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className={`h-12 px-6 glass border-white/10 ${filterUnapplied ? 'bg-primary/20 text-primary-foreground' : ''}`}
                onClick={() => setFilterUnapplied(!filterUnapplied)}
              >
                {filterUnapplied ? "전체 보기" : "2차 미신청자 필터"}
              </Button>
              <div className="h-12 px-4 glass border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Total</span>
                <span className="text-lg font-black text-primary">{filteredParticipants.length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className={`${AG_GRID_THEME} w-full h-[600px] border-none shadow-inner`}>
          <AgGridReact
            rowData={filteredParticipants}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={56}
            theme="legacy"
            defaultColDef={defaultColDef}
          />
        </div>
      </Card>

      <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <UserCog className="text-blue-400" />
              참여자 상세 정보
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedParticipant?.nickname}님의 시스템 기록입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedParticipant && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <Fingerprint className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Unique UUID</p>
                    <p className="text-xs font-mono break-all text-blue-300">{selectedParticipant.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <Calendar className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">가입일시</p>
                    <p className="text-xs">{new Date(selectedParticipant.created_at).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <History className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold">최근참여</p>
                    <p className="text-xs">{selectedParticipant.last_participated_at ? new Date(selectedParticipant.last_participated_at).toLocaleString() : '-'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-2">활동 통계</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><MessageSquare className="w-3 h-3" /> 받은 쪽지</span>
                      <span className="font-bold text-blue-400">{participantStats.received}개</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><MessageSquare className="w-3 h-3 opacity-50" /> 보낸 쪽지</span>
                      <span className="font-bold">{participantStats.sent}개</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><Music className="w-3 h-3" /> 노래 신청</span>
                      <span className="font-bold text-green-400">{participantStats.songs}회</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> SOS 요청</span>
                      <span className="font-bold text-red-400">{participantStats.sos}회</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1 mb-2 flex items-center gap-2">
                    <History className="w-3 h-3" /> 닉네임 변경 이력
                  </p>
                  {nicknameHistory.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">변경 이력이 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {nicknameHistory.map((h, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-slate-900/50 rounded border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 line-through">{h.old_nickname}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="font-bold text-blue-300">{h.new_nickname}</span>
                          </div>
                          <span className="text-slate-600">{new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">1차 신청</p>
                      <p className="text-sm font-bold">{selectedParticipant.is_first_applied ? '신청완료' : '미신청'}</p>
                    </div>
                    {selectedParticipant.is_first_applied && <ShieldCheck className="text-green-500 w-5 h-5" />}
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">2차 신청</p>
                      <p className="text-sm font-bold">{selectedParticipant.is_second_applied ? '신청완료' : '미신청'}</p>
                    </div>
                    {selectedParticipant.is_second_applied && <ShieldCheck className="text-green-500 w-5 h-5" />}
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 flex justify-around">
                  <div className="text-center">
                    <p className="text-[10px] text-blue-400 uppercase font-bold">큐피트 횟수</p>
                    <p className="text-2xl font-black text-blue-50">{selectedParticipant.cupid_count || 0}</p>
                  </div>
                  <div className="w-[1px] bg-blue-500/20" />
                  <div className="text-center">
                    <p className="text-[10px] text-blue-400 uppercase font-bold">호감 표시</p>
                    <p className="text-2xl font-black text-blue-50">{selectedParticipant.like_count || 0}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => setSelectedParticipant(null)}>확인</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
