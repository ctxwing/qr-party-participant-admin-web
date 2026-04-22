'use server'

import { db } from '@/database/db'
import { participants, partySessions } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'

export async function registerParticipant(anonymousId: string, nickname: string) {
  try {
    // 1. 활성화된 세션 확인 (없으면 생성 - MVP 편의를 위해)
    let session = await db.query.partySessions.findFirst({
      where: eq(partySessions.status, 'ONGOING')
    })

    if (!session) {
      // 테스트용 세션 강제 생성
      const [newSession] = await db.insert(partySessions).values({
        title: "환영 파티",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // 1시간 후
        status: 'ONGOING'
      }).returning()
      session = newSession
    }

    // 2. 참여자 정보 저장 (upsert)
    const [participant] = await db.insert(participants).values({
      sessionId: session.id,
      anonymousId: anonymousId,
      nickname: nickname,
      nicknameChangeCount: 1,
    })
    .onConflictDoUpdate({
      target: participants.anonymousId,
      set: { 
        nickname: nickname,
        nicknameChangeCount: sql`nickname_change_count + 1` 
      }
    })
    .returning()

    return { success: true, participant }
  } catch (error) {
    console.error('참여자 등록 에러:', error)
    return { success: false, error: '등록에 실패했습니다.' }
  }
}
