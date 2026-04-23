/**
 * T006: 파티 생명주기(Draft->Active->Completed) 전환 및 중복 활성 방지 로직 구현
 * - 상태 전환 규칙 검증
 * - 동일 URL에 활성 파티 중복 방지 검증
 * - 시간 유효성 검증 (종료 > 시작)
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";

// 파티 상태 타입 정의
type PartyStatus = "draft" | "active" | "completed";

// 파티 인터페이스
interface Party {
  id: string;
  name: string;
  start_at: Date;
  end_at: Date;
  status: PartyStatus;
  qr_anchor_url: string;
  max_participants: number;
}

// 상태 전환 규칙: 허용된 전환만 정의
const VALID_TRANSITIONS: Record<PartyStatus, PartyStatus[]> = {
  draft: ["active"],
  active: ["completed"],
  completed: [], // 종료된 파티는 상태 변경 불가
};

/**
 * 파티 상태 전환 가능 여부를 확인합니다.
 */
function canTransition(current: PartyStatus, next: PartyStatus): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

/**
 * 파티 시간 유효성을 검증합니다.
 */
function validatePartyTime(start_at: Date, end_at: Date): { valid: boolean; error?: string } {
  if (end_at <= start_at) {
    return { valid: false, error: "종료 시간은 시작 시간 이후여야 합니다." };
  }
  return { valid: true };
}

/**
 * 동일 URL에 활성화(active) 상태인 파티가 이미 있는지 확인합니다.
 */
function hasActivePartyWithUrl(parties: Party[], url: string, excludeId?: string): boolean {
  return parties.some(
    (p) => p.qr_anchor_url === url && p.status === "active" && p.id !== excludeId
  );
}

/**
 * 파티 상태를 전환합니다. (비즈니스 로직)
 */
function transitionParty(
  party: Party,
  newStatus: PartyStatus,
  allParties: Party[]
): { success: boolean; error?: string } {
  // 1. 상태 전환 규칙 확인
  if (!canTransition(party.status, newStatus)) {
    return { success: false, error: `${party.status} → ${newStatus} 전환은 허용되지 않습니다.` };
  }

  // 2. active로 전환 시 중복 활성 파티 체크
  if (newStatus === "active") {
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

// ========== 테스트 ==========

describe("T006: 파티 생명주기 전환 로직 검증", () => {
  // --- 상태 전환 규칙 ---
  test("draft → active 전환이 허용되어야 한다", () => {
    expect(canTransition("draft", "active")).toBe(true);
  });

  test("active → completed 전환이 허용되어야 한다", () => {
    expect(canTransition("active", "completed")).toBe(true);
  });

  test("draft → completed 직접 전환은 불가해야 한다", () => {
    expect(canTransition("draft", "completed")).toBe(false);
  });

  test("completed → active 역전환은 불가해야 한다", () => {
    expect(canTransition("completed", "active")).toBe(false);
  });

  test("completed → draft 역전환은 불가해야 한다", () => {
    expect(canTransition("completed", "draft")).toBe(false);
  });

  test("active → draft 역전환은 불가해야 한다", () => {
    expect(canTransition("active", "draft")).toBe(false);
  });

  // --- 시간 유효성 ---
  test("종료 시간이 시작 시간 이전이면 에러를 반환해야 한다", () => {
    const result = validatePartyTime(
      new Date("2026-04-24T20:00:00+09:00"),
      new Date("2026-04-24T18:00:00+09:00") // 시작보다 앞선 종료
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("종료 시간");
  });

  test("종료 시간이 시작 시간 이후면 유효해야 한다", () => {
    const result = validatePartyTime(
      new Date("2026-04-24T18:00:00+09:00"),
      new Date("2026-04-24T22:00:00+09:00")
    );
    expect(result.valid).toBe(true);
  });

  // --- 중복 활성 방지 ---
  test("동일 URL에 active 파티가 이미 있으면 활성화를 막아야 한다", () => {
    const existingParties: Party[] = [
      {
        id: "party-1",
        name: "기존 파티",
        start_at: new Date(),
        end_at: new Date(),
        status: "active",
        qr_anchor_url: "https://qrparty.example.com/join",
        max_participants: 50,
      },
    ];

    const newParty: Party = {
      id: "party-2",
      name: "신규 파티",
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      status: "draft",
      qr_anchor_url: "https://qrparty.example.com/join", // 동일 URL
      max_participants: 30,
    };

    const result = transitionParty(newParty, "active", existingParties);
    expect(result.success).toBe(false);
    expect(result.error).toContain("이미 진행 중인 파티");
  });

  test("다른 URL이면 동시에 active 파티가 가능해야 한다", () => {
    const existingParties: Party[] = [
      {
        id: "party-1",
        name: "기존 파티",
        start_at: new Date(),
        end_at: new Date(),
        status: "active",
        qr_anchor_url: "https://qrparty.example.com/join-a",
        max_participants: 50,
      },
    ];

    const newParty: Party = {
      id: "party-2",
      name: "신규 파티",
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      status: "draft",
      qr_anchor_url: "https://qrparty.example.com/join-b", // 다른 URL
      max_participants: 30,
    };

    const result = transitionParty(newParty, "active", existingParties);
    expect(result.success).toBe(true);
  });

  test("기존 active 파티가 completed면 같은 URL로 새 파티 활성화 가능", () => {
    const existingParties: Party[] = [
      {
        id: "party-1",
        name: "완료된 파티",
        start_at: new Date(),
        end_at: new Date(),
        status: "completed", // 이미 종료
        qr_anchor_url: "https://qrparty.example.com/join",
        max_participants: 50,
      },
    ];

    const newParty: Party = {
      id: "party-2",
      name: "신규 파티",
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      status: "draft",
      qr_anchor_url: "https://qrparty.example.com/join",
      max_participants: 30,
    };

    const result = transitionParty(newParty, "active", existingParties);
    expect(result.success).toBe(true);
  });
});
