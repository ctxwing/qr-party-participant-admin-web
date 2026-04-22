import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useStore } from '@/store/useStore'
import { toast } from 'sonner'

export function useRealtime(participantId: string | undefined) {
  const { addAlert } = useStore()
  const supabase = createClient()

  useEffect(() => {
    if (!participantId) return

    // 1. 알림(Alerts) 구독
    const alertChannel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `participant_id=eq.${participantId}`,
        },
        (payload) => {
          console.log('새 알림 수신:', payload)
          const newAlert = payload.new as any
          addAlert({
            id: newAlert.id,
            type: newAlert.type,
            message: newAlert.message,
            createdAt: new Date(newAlert.created_at),
          })
          toast.info(`[알림] ${newAlert.message}`)
        }
      )
      .subscribe()

    // 2. 쪽지(Messages) 구독
    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${participantId}`,
        },
        (payload) => {
          console.log('새 쪽지 수신:', payload)
          toast.success('새로운 쪽지가 도착했습니다!')
          // TODO: 쪽지 목록 상태 업데이트 로직 추가
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(alertChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [participantId, addAlert])
}
