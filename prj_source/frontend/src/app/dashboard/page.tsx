'use client'

import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { participant } = useStore()

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center pt-20">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">나의 현황</h1>
        
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle>반갑습니다, {participant?.nickname || '참여자'}님!</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background/40 rounded-xl">
              <p className="text-2xl">📩</p>
              <p className="text-sm font-bold">쪽지</p>
              <p className="text-xl font-bold mt-1">0</p>
            </div>
            <div className="p-4 bg-background/40 rounded-xl">
              <p className="text-2xl">💘</p>
              <p className="text-sm font-bold">큐핏</p>
              <p className="text-xl font-bold mt-1">0</p>
            </div>
            <div className="p-4 bg-background/40 rounded-xl">
              <p className="text-2xl">⭐</p>
              <p className="text-sm font-bold">호감</p>
              <p className="text-xl font-bold mt-1">0</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground">
          <p>파티원들의 정보를 탐색하고 상호작용을 시작해보세요!</p>
        </div>
      </div>
    </div>
  )
}
