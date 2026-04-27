'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Settings2, Play, Heart, Zap, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'

interface WeightConfig {
  like: number
  cupid: number
  message: number
}

interface LimitConfig {
  hearts: number
  cupids: number
  messages: number
}

interface PresetConfig {
  name: string
  desc: string
  weights: WeightConfig
  interactionLimits: LimitConfig
}

export const PRESETS: Record<string, PresetConfig> = {
  balanced: {
    name: '기본형',
    desc: '균형 잡힌 점수 산정',
    weights: { like: 1, cupid: 10, message: 5 },
    interactionLimits: { hearts: 3, cupids: 2, messages: 20 }
  },
  talkative: {
    name: '소통 중심',
    desc: '쪽지 소통에 높은 배점',
    weights: { like: 1, cupid: 10, message: 20 },
    interactionLimits: { hearts: 2, cupids: 1, messages: 50 }
  },
  matching: {
    name: '매칭 중심',
    desc: '큐피트 성공에 높은 배점',
    weights: { like: 1, cupid: 50, message: 5 },
    interactionLimits: { hearts: 5, cupids: 5, messages: 10 }
  }
}

export function SettingsTab() {
  const [weights, setWeights] = useState<WeightConfig>({ like: 1, cupid: 10, message: 5 })
  const [interactionLimits, setInteractionLimits] = useState<LimitConfig>({ hearts: 3, cupids: 2, messages: 20 })
  const [unlimitedMessages, setUnlimitedMessages] = useState(false)
  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    const [weightsRes, limitsRes] = await Promise.all([
      supabase.from('system_settings').select('value').eq('key', 'ranking_weights').maybeSingle(),
      supabase.from('system_settings').select('value').eq('key', 'interaction_limits').maybeSingle()
    ])
    if (weightsRes.data) setWeights(weightsRes.data.value)
    if (limitsRes.data) {
      setInteractionLimits(limitsRes.data.value)
      setUnlimitedMessages(limitsRes.data.value.messages === 0)
    }
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 최초 설정 로드
    fetchSettings()
  }, [fetchSettings])

  const handleUpdateWeights = async () => {
    const [weightError, limitsError] = await Promise.all([
      supabase.from('system_settings').upsert({ key: 'ranking_weights', value: weights }),
      supabase.from('system_settings').upsert({ key: 'interaction_limits', value: interactionLimits })
    ]).then(results => [results[0].error, results[1].error])

    if (!weightError && !limitsError) {
      toast.success('설정이 저장되었습니다. (가중치 + 발송 한도)')
    } else {
      toast.error('저장 실패. 콘솔 확인.')
    }
  }

  const handleApplyPreset = (preset: PresetConfig) => {
    setWeights(preset.weights)
    setInteractionLimits(preset.interactionLimits)
    toast.info('프리셋이 적용되었습니다. 하단 저장 버튼을 눌러 확정하세요.')
  }

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-blue-400" />
          시스템 설정
        </CardTitle>
        <CardDescription>랭킹 산정 가중치 및 시스템 전역 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-3 h-3 text-blue-500" /> 랭킹 프리셋 선택
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handleApplyPreset(p.weights)}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <p className="font-bold group-hover:text-blue-400">{p.name}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 랭킹 가중치 */}
          <div className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">랭킹 가중치 설정</h3>
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-sm flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-rose-500" /> 호감 (Heart)</label>
              <Input
                type="number"
                value={weights.like}
                onChange={(e) => setWeights({ ...weights, like: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-800"
              />

              <label className="text-sm flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> 큐피트 (Cupid)</label>
              <Input
                type="number"
                value={weights.cupid}
                onChange={(e) => setWeights({ ...weights, cupid: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-800"
              />

              <label className="text-sm flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> 쪽지 (Message)</label>
              <Input
                type="number"
                value={weights.message}
                onChange={(e) => setWeights({ ...weights, message: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-800"
              />
            </div>
          </div>

          {/* 상호작용 한도 */}
          <div className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">발송 가능 한도</h3>
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-sm flex items-center gap-2"><Heart className="w-3.5 h-3.5 text-rose-500" /> 호감 (Hearts)</label>
              <Input
                type="number"
                value={interactionLimits.hearts}
                onChange={(e) => setInteractionLimits({ ...interactionLimits, hearts: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-800"
              />

              <label className="text-sm flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> 큐피트 (Cupids)</label>
              <Input
                type="number"
                value={interactionLimits.cupids}
                onChange={(e) => setInteractionLimits({ ...interactionLimits, cupids: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-800"
              />

              <label className="text-sm flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> 쪽지 (Messages)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={unlimitedMessages ? 0 : interactionLimits.messages}
                  onChange={(e) => setInteractionLimits({ ...interactionLimits, messages: parseInt(e.target.value) || 0 })}
                  className="bg-slate-900 border-slate-800"
                  disabled={unlimitedMessages}
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <Switch
                    checked={unlimitedMessages}
                    onCheckedChange={(checked) => {
                      setUnlimitedMessages(checked)
                      if (checked) setInteractionLimits({ ...interactionLimits, messages: 0 })
                    }}
                  />
                  <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">무제한</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 h-12" onClick={handleUpdateWeights}>
          설정 저장 및 적용
        </Button>
      </CardContent>
    </Card>
  )
}
