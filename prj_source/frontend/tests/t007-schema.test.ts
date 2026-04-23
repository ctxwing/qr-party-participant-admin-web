/**
 * T007: Drizzle ORM 스키마 검증 테스트
 * - parties, announcements, externalReservations 스키마 객체 정상 정의 여부 확인
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";
import { parties, announcements, externalReservations } from "../../database/schema";
import { getTableName } from "drizzle-orm";

describe("T007: 데이터베이스 스키마 검증", () => {
  test("parties 테이블 스키마가 정상적으로 정의되어야 한다", () => {
    expect(parties).toBeDefined();
    expect(getTableName(parties)).toBe("parties");
    
    // 주요 컬럼 존재 여부 확인
    expect(parties.id).toBeDefined();
    expect(parties.name).toBeDefined();
    expect(parties.start_at).toBeDefined();
    expect(parties.status).toBeDefined();
  });

  test("announcements 테이블 스키마가 정상적으로 정의되어야 한다", () => {
    expect(announcements).toBeDefined();
    expect(getTableName(announcements)).toBe("announcements");
    
    // 주요 컬럼 존재 여부 확인
    expect(announcements.id).toBeDefined();
    expect(announcements.party_id).toBeDefined();
    expect(announcements.content).toBeDefined();
    expect(announcements.type).toBeDefined();
  });

  test("externalReservations 테이블 스키마가 정상적으로 정의되어야 한다", () => {
    expect(externalReservations).toBeDefined();
    expect(getTableName(externalReservations)).toBe("external_reservations");
    
    // 주요 컬럼 존재 여부 확인
    expect(externalReservations.id).toBeDefined();
    expect(externalReservations.party_id).toBeDefined();
    expect(externalReservations.name).toBeDefined();
  });
});
