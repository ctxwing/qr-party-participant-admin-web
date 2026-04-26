import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { PRESETS } from '@/components/admin/SettingsTab'

export function useAdminData(adminUserId?: string) {
  const [sessionStatus, setSessionStatus] = useState<'READY' | 'ONGOING' | 'FINISHED'>('ONGOING')
  const [alerts, setAlerts] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()

  console.log('useAdminData initialized with adminUserId:', adminUserId)

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase.from('participants').select('*').order('nickname')
    if (data) setParticipants(data)
  }, [supabase])

  const fetchMessages = useCallback(async () => {
    try {
      const [msgRes, partRes] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('participants').select('id, nickname')
      ])
      if (msgRes.data && partRes.data) {
        const partMap = new Map(partRes.data.map(p => [p.id, p]))
        const joined = msgRes.data.map(m => ({
          ...m,
          sender: partMap.get(m.sender_id),
          receiver: partMap.get(m.receiver_id)
        }))
        setMessages(joined)
      }
    } catch (error) {
      console.error('Messages fetch error:', error)
    }
  }, [supabase])

  const fetchAlerts = useCallback(async () => {
    try {
      const [alertRes, partRes] = await Promise.all([
        supabase.from('alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('participants').select('id, nickname')
      ])
      if (alertRes.data && partRes.data) {
        const partMap = new Map(partRes.data.map(p => [p.id, p]))
        const joined = alertRes.data.map(a => ({
          ...a,
          participants: partMap.get(a.participant_id)
        }))
        console.log('fetchAlerts 완료, 새 alerts:', joined)
        // 각 alert의 resolved 값 확인
        joined.forEach(a => {
          console.log(`  ID: ${a.id.slice(0, 8)}... resolved: ${a.resolved}`)
        })
        setAlerts(joined)
      }
    } catch (error) {
      console.error('Alerts fetch error:', error)
    }
  }, [supabase])

  const fetchInitialData = useCallback(async () => {
    const { data: session } = await supabase.from('party_sessions').select('status').eq('status', 'ONGOING').maybeSingle()
    setSessionStatus(session?.status as any || 'READY')
    await Promise.all([fetchParticipants(), fetchMessages(), fetchAlerts()])
  }, [fetchParticipants, fetchMessages, fetchAlerts, supabase])

  const handleToggleResolve = useCallback(async (id: string, current: boolean) => {
    if (!id) return
    if (!adminUserId) {
      toast.error('Admin user ID가 설정되지 않았습니다.')
      return
    }
    console.log('UPDATE 시작:', id, 'resolved:', !current, 'adminUserId:', adminUserId)

    const { data, error } = await supabase.from('alerts').update({ resolved: !current }).eq('id', id).select('*')
    console.log('UPDATE 응답:', data, error)
    if (error) {
      toast.error('상태 변경 실패: ' + (error.message || '로그 확인'))
    } else {
      toast.success(current ? '미해결 상태로 변경' : '해결 완료 처리')
      await fetchAlerts()
    }
  }, [fetchAlerts, supabase, adminUserId])

  const handleUpdateCount = useCallback(async (id: string, field: string, value: number) => {
    const { error } = await supabase.from('participants').update({ [field]: value }).eq('id', id)
    if (!error) {
      toast.success('횟수가 조정되었습니다.')
      fetchParticipants()
    }
  }, [fetchParticipants, supabase])

  const handleToggleApply = useCallback(async (id: string, field: string, current: boolean) => {
    await supabase.from('participants').update({ [field]: !current }).eq('id', id)
    toast.success('신청 상태가 변경되었습니다.')
    fetchParticipants()
  }, [fetchParticipants, supabase])

  const handleToggleSession = useCallback(async () => {
    if (sessionStatus === 'ONGOING') {
      if (!window.confirm('정말 파티를 종료하시겠습니까? 종료 후에는 참여자들이 더 이상 활동할 수 없습니다.')) return
      await supabase.from('party_sessions').update({ status: 'FINISHED', end_time: new Date().toISOString() }).eq('status', 'ONGOING')
      setSessionStatus('FINISHED')
      toast.success('세션이 종료되었습니다.')
    } else {
      const title = prompt('행사명을 입력하세요', '오늘의 파티') || '오늘의 파티'
      await supabase.from('party_sessions').insert({ status: 'ONGOING', title, start_time: new Date().toISOString() })
      setSessionStatus('ONGOING')
      toast.success('새로운 세션이 시작되었습니다.')
    }
    fetchInitialData()
  }, [sessionStatus, fetchInitialData, supabase])

  useEffect(() => {
    fetchInitialData()

    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, async (payload) => {
        const [alertRes, partRes] = await Promise.all([
          supabase.from('alerts').select('*').eq('id', payload.new.id).single(),
          supabase.from('participants').select('id, nickname')
        ])
        if (alertRes.data && partRes.data) {
          const participant = partRes.data.find(p => p.id === alertRes.data.participant_id)
          const newAlert = { ...alertRes.data, participants: participant }
          setAlerts(prev => [newAlert, ...prev])
          const title = newAlert.type === 'SOS' ? '🚨 SOS 긴급 요청!' : '🎵 노래 신청 수신!'
          const msg = newAlert.message.split(':').slice(1).join(':') || newAlert.message
          toast(title, { description: `from ${participant?.nickname || '참여자'}\n${msg}`, duration: 10000 })
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'alerts' }, () => fetchAlerts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchParticipants())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchMessages())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    sessionStatus, handleToggleSession,
    participants, fetchParticipants, handleUpdateCount, handleToggleApply,
    messages, fetchMessages,
    alerts, fetchAlerts, handleToggleResolve,
  }
}
