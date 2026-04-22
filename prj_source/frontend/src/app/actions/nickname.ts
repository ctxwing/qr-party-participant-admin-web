'use server'

import { createClient } from '@/lib/supabase-server'

export async function updateNickname(participantId: string, newNickname: string) {
  try {
    const supabase = await createClient()

    // 1. 현재 참여자 정보 조회 (변경 횟수 확인)
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('nickname_change_count')
      .eq('id', participantId)
      .single()

    if (fetchError) throw fetchError
    
    const currentCount = participant.nickname_change_count || 0

    if (currentCount >= 3) {
      return { success: false, error: '닉네임 변경 횟수(3회)를 모두 소진하였습니다.' }
    }

    // 2. 닉네임 업데이트 및 횟수 증가
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        nickname: newNickname,
        nickname_change_count: currentCount + 1,
        last_active: new Date().toISOString()
      })
      .eq('id', participantId)

    if (updateError) throw updateError

    return { success: true, newCount: currentCount + 1 }
  } catch (error: any) {
    console.error('닉네임 변경 에러:', error)
    return { success: false, error: error.message || '닉네임 변경에 실패했습니다.' }
  }
}
