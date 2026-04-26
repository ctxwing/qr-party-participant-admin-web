'use server'

import { createClient } from '@/lib/supabase-server'

export async function updateNickname(participantId: string, newNickname: string) {
  try {
    const supabase = await createClient()

    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('nickname, nickname_change_count')
      .eq('id', participantId)
      .single()

    if (fetchError) {
      console.error('fetchError:', fetchError)
      return { success: false, error: '참여자 정보 조회 실패' }
    }

    if (!participant) {
      return { success: false, error: '참여자를 찾을 수 없습니다.' }
    }

    const currentCount = participant.nickname_change_count || 0

    if (currentCount >= 3) {
      return { success: false, error: '닉네임 변경 횟수(3회)를 모두 소진하였습니다.' }
    }

    if (newNickname === participant.nickname) {
      return { success: false, error: '현재 닉네임과 동일합니다.' }
    }

    const { error: updateError } = await supabase
      .from('participants')
      .update({
        nickname: newNickname,
        nickname_change_count: currentCount + 1,
        last_active: new Date().toISOString()
      })
      .eq('id', participantId)

    if (updateError) {
      console.error('updateError:', updateError)
      return { success: false, error: '닉네임 업데이트 실패: ' + updateError.message }
    }

    const { error: historyError } = await supabase
      .from('nickname_history')
      .insert({
        participant_id: participantId,
        old_nickname: participant.nickname,
        new_nickname: newNickname
      })

    if (historyError) {
      console.error('historyError:', historyError)
    }

    return { success: true, newCount: currentCount + 1 }
  } catch (error: any) {
    console.error('updateNickname error:', error)
    return { success: false, error: error.message || '닉네임 변경에 실패했습니다.' }
  }
}
