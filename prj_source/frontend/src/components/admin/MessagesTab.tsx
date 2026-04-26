'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Activity, ArrowRight } from 'lucide-react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { defaultColDef, AG_GRID_THEME } from '@/lib/ag-grid-setup'
import { formatDate } from '@/lib/admin-utils'

const messageColumnDefs: ColDef[] = [
  {
    field: 'created_at',
    headerName: '시간',
    width: 160,
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    headerName: '보낸이',
    width: 150,
    valueGetter: (params: any) => params.data.sender?.nickname || '알수없음',
    cellRenderer: (params: any) => <span className="font-black text-primary">{params.value}</span>
  },
  {
    headerName: '',
    width: 50,
    cellRenderer: () => <ArrowRight className="w-4 h-4 text-white/20" />,
    filter: false,
    sortable: false
  },
  {
    headerName: '받는이',
    width: 150,
    valueGetter: (params: any) => params.data.receiver?.nickname || '알수없음',
    cellRenderer: (params: any) => <span className="font-black text-blue-400">{params.value}</span>
  },
  {
    field: 'content',
    headerName: '내용',
    flex: 1,
    cellRenderer: (params: any) => <span className="text-sm">{params.value}</span>
  }
]

interface MessagesTabProps {
  messages: any[]
  fetchMessages: () => void
}

export function MessagesTab({ messages, fetchMessages }: MessagesTabProps) {
  return (
    <Card className="glass border-none shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            참여자간 쪽지 모니터링
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-white/40 border-white/10">{messages.length} Messages</Badge>
            <Button variant="ghost" size="sm" onClick={fetchMessages} className="hover:bg-white/5"><Activity className="w-3 h-3 mr-2" /> Refresh</Button>
          </div>
        </div>
      </CardHeader>
      <div className={`${AG_GRID_THEME} w-full h-[650px] border-none shadow-inner`}>
        <AgGridReact
          rowData={messages}
          columnDefs={messageColumnDefs}
          pagination={true}
          paginationPageSize={20}
          rowHeight={56}
          theme="legacy"
          defaultColDef={defaultColDef}
        />
      </div>
    </Card>
  )
}
