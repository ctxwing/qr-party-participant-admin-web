'use client'

import { useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Clock, Activity } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { defaultColDef, AG_GRID_THEME } from '@/lib/ag-grid-setup'
import { formatDate } from '@/lib/admin-utils'

interface DashboardTabProps {
  participants: any[]
  messages: any[]
  alerts: any[]
  fetchAlerts: () => void
  handleToggleResolve: (id: string, current: boolean) => void
}

export function DashboardTab({ participants, messages, alerts, fetchAlerts, handleToggleResolve }: DashboardTabProps) {
  const gridRef = useRef<AgGridReact>(null)

  // alerts 변경 시 ag-grid 업데이트
  useEffect(() => {
    console.log('DashboardTab alerts 변경 감지:', alerts)
    if (gridRef.current?.api) {
      console.log('ag-grid rowData 업데이트 중...')
      // 새로운 배열로 명시적으로 교체
      gridRef.current.api.setGridOption('rowData', [...alerts])
      // 추가로 forceRefresh
      gridRef.current.api.refreshCells({ force: true })
    }
  }, [alerts])

  const alertColumnDefs: ColDef[] = [
    {
      field: 'created_at',
      headerName: '시간',
      width: 160,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'type',
      headerName: '구분',
      width: 100,
      cellRenderer: (params: any) => (
        <Badge variant={params.value === 'SOS' ? 'destructive' : 'default'} className="font-bold">
          {params.value === 'SOS' ? '🚨 SOS' : '🎵 MUSIC'}
        </Badge>
      )
    },
    {
      headerName: '요청자',
      width: 150,
      valueGetter: (params: any) => params.data.participants?.nickname || '시스템',
      cellRenderer: (params: any) => <span className="font-black text-primary">{params.value}</span>
    },
    {
      field: 'message',
      headerName: '내용',
      flex: 2,
      cellRenderer: (params: any) => <span className="text-sm opacity-90">{params.value.split(':').slice(1).join(':') || params.value}</span>
    },
    {
      field: 'resolved',
      headerName: '해결',
      width: 100,
      cellRenderer: (params: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={params.value}
            onCheckedChange={async () => {
              console.log('Switch 클릭 - Before:', params.data.id, params.value)
              await handleToggleResolve(params.data.id, params.value)
              console.log('handleToggleResolve 완료')
              // 강제 새로고침
              setTimeout(() => {
                console.log('ag-grid 강제 새로고침 실행')
                gridRef.current?.api?.refreshCells({ force: true })
              }, 50)
            }}
            label={params.value ? '완료' : '대기'}
            className="gap-2"
          />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Active Participants</CardDescription>
            <CardTitle className="text-4xl font-black text-blue-400 text-glow">{participants.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="glass border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Total Messages</CardDescription>
            <CardTitle className="text-4xl font-black text-emerald-400 text-glow">{messages.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="glass border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-sos" />
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">SOS Requests</CardDescription>
            <CardTitle className="text-4xl font-black text-sos text-glow">
              {alerts.filter(a => a.type === 'SOS').length}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">완료 {alerts.filter(a => a.type === 'SOS' && a.resolved).length}</Badge>
              <Badge variant="outline" className="text-[10px] bg-sos/10 text-sos border-sos/20">미완료 {alerts.filter(a => a.type === 'SOS' && !a.resolved).length}</Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-widest font-bold text-white/40 text-[10px]">Song Requests</CardDescription>
            <CardTitle className="text-4xl font-black text-purple-400 text-glow">
              {alerts.filter(a => a.type === 'MUSIC').length}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">완료 {alerts.filter(a => a.type === 'MUSIC' && a.resolved).length}</Badge>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">미완료 {alerts.filter(a => a.type === 'MUSIC' && !a.resolved).length}</Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass border-none shadow-2xl overflow-hidden mt-8">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              실시간 요청 처리 이력 (SOS / 노래)
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-white/40 border-white/10">{alerts.length} Total Alerts</Badge>
              <Button variant="ghost" size="sm" onClick={fetchAlerts} className="hover:bg-white/5"><Activity className="w-3 h-3 mr-2" /> Refresh</Button>
            </div>
          </div>
        </CardHeader>
        <div className={`${AG_GRID_THEME} w-full h-[500px] border-none`}>
          <AgGridReact
            ref={gridRef}
            rowData={alerts}
            columnDefs={alertColumnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={60}
            theme="legacy"
            defaultColDef={defaultColDef}
          />
        </div>
      </Card>
    </div>
  )
}
