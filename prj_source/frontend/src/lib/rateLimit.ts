/**
 * 클라이언트 사이드 상호작용 제한 (Rate Limit) 유틸리티
 */

const lastInteractionTime: Record<string, number> = {};
const INTERACTION_COOLDOWN = 3000; // 3초

export function checkRateLimit(participantId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const lastTime = lastInteractionTime[participantId] || 0;
  const elapsed = now - lastTime;

  if (elapsed < INTERACTION_COOLDOWN) {
    return {
      allowed: false,
      remaining: Math.ceil((INTERACTION_COOLDOWN - elapsed) / 1000)
    };
  }

  // 시간 업데이트
  lastInteractionTime[participantId] = now;
  return { allowed: true, remaining: 0 };
}
