/**
 * 파티 생명주기 관리 유틸리티
 * - 상태 전환 규칙, 시간 유효성, 중복 활성 방지 로직
 * 작성자: ctxwing@gmail.com
 */

// 파티 상태 타입
export type PartyStatus = "draft" | "active" | "completed";

// 파티 인터페이스
export interface Party {
  id: string;
  name: string;
  description?: string;
  start_at: Date | string;
  end_at: Date | string;
  status: PartyStatus;
  qr_anchor_url?: string;
  max_participants: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// 허용된 상태 전환 규칙
const VALID_TRANSITIONS: Record<PartyStatus, PartyStatus[]> = {
  draft: ["active"],
  active: ["completed"],
  completed: [],
};

/**
 * 파티 상태 전환 가능 여부를 확인합니다.
 */
export function canTransition(current: PartyStatus, next: PartyStatus): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

/**
 * 파티 시간 유효성을 검증합니다.
 */
export function validatePartyTime(
  start_at: Date | string,
  end_at: Date | string
): { valid: boolean; error?: string } {
  const start = new Date(start_at);
  const end = new Date(end_at);

  if (end <= start) {
    return { valid: false, error: "종료 시간은 시작 시간 이후여야 합니다." };
  }
  return { valid: true };
}

/**
 * 동일 URL에 활성화(active) 상태인 파티가 이미 있는지 확인합니다.
 */
export function hasActivePartyWithUrl(
  parties: Party[],
  url: string,
  excludeId?: string
): boolean {
  return parties.some(
    (p) => p.qr_anchor_url === url && p.status === "active" && p.id !== excludeId
  );
}

/**
 * 파티 상태를 전환합니다.
 * @returns 성공 여부와 에러 메시지
 */
export function transitionParty(
  party: Party,
  newStatus: PartyStatus,
  allParties: Party[]
): { success: boolean; error?: string } {
  if (!canTransition(party.status, newStatus)) {
    return {
      success: false,
      error: `${party.status} → ${newStatus} 전환은 허용되지 않습니다.`,
    };
  }

  if (newStatus === "active" && party.qr_anchor_url) {
    if (hasActivePartyWithUrl(allParties, party.qr_anchor_url, party.id)) {
      return {
        success: false,
        error: `동일 URL(${party.qr_anchor_url})에 이미 진행 중인 파티가 있습니다.`,
      };
    }
  }

  party.status = newStatus;
  return { success: true };
}

// 상태별 표시 라벨 및 색상
export const PARTY_STATUS_CONFIG: Record<
  PartyStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: "대기", color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  active: { label: "진행 중", color: "text-green-400", bgColor: "bg-green-400/10" },
  completed: { label: "종료", color: "text-gray-400", bgColor: "bg-gray-400/10" },
};
