'use server'

import { createClient } from '@/lib/supabase-server'

export async function registerParticipant(anonymousId: string, nickname: string) {
  try {
    const supabase = await createClient()

    // 1. 활성화된 세션 확인 (없으면 생성 - MVP 편의를 위해)
    const { data: session, error: sessionError } = await supabase
      .from('party_sessions')
      .select('*')
      .eq('status', 'ONGOING')
      .single()

    let activeSession = session

    if (!activeSession) {
      // 테스트용 세션 강제 생성
      const { data: newSession, error: createError } = await supabase
        .from('party_sessions')
        .insert({
          title: "환영 파티",
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          status: 'ONGOING'
        })
        .select()
        .single()

      if (createError) throw createError
      activeSession = newSession
    }

    // 2. 참여자 정보 저장 (upsert)
    // anonymous_id를 기준으로 중복 확인 및 닉네임 업데이트
    const { data: participant, error: upsertError } = await supabase
      .from('participants')
      .upsert({
        session_id: activeSession.id,
        anonymous_id: anonymousId,
        nickname: nickname,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'anonymous_id'
      })
      .select()
      .single()

    if (upsertError) throw upsertError

    return { success: true, participant }
  } catch (error: any) {
    console.error('참여자 등록 에러:', error)
    return { success: false, error: error.message || '등록에 실패했습니다.' }
  }
}
