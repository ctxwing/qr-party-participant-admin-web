/**
 * T004: Supabase Realtime을 통한 실시간 공지 수신 기술 검증
 * - Realtime 채널 생성 및 이벤트 구독 구조 검증
 * - 브로드캐스트 메시지 타입 정의
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";
import { createClient } from "@supabase/supabase-js";

// 테스트용 Supabase 클라이언트 (실제 연결 없음)
const supabase = createClient(
  "https://dummy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder"
);

// 공지 메시지 타입 정의
interface AnnouncementMessage {
  party_id: string;
  content: string;
  type: "info" | "emergency" | "notice";
  created_at: string;
}

describe("T004: Supabase Realtime 실시간 공지 수신 검증", () => {
  test("Realtime 채널을 생성할 수 있어야 한다", () => {
    const channel = supabase.channel("announcements");
    expect(channel).toBeDefined();
    expect(channel.on).toBeDefined();
    supabase.removeChannel(channel);
  });

  test("broadcast 이벤트를 구독할 수 있어야 한다", () => {
    const channel = supabase.channel("party-announcements");

    // broadcast 구독 설정이 가능한지 확인
    const subscribedChannel = channel.on(
      "broadcast",
      { event: "new-announcement" },
      (payload) => {
        // 콜백 구조 검증
        expect(payload).toBeDefined();
      }
    );

    expect(subscribedChannel).toBeDefined();
    supabase.removeChannel(channel);
  });

  test("postgres_changes 이벤트를 구독할 수 있어야 한다", () => {
    const channel = supabase.channel("db-announcements");

    // INSERT 이벤트 구독 설정
    const subscribedChannel = channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "announcements",
      },
      (payload) => {
        expect(payload).toBeDefined();
      }
    );

    expect(subscribedChannel).toBeDefined();
    supabase.removeChannel(channel);
  });

  test("공지 메시지 타입이 올바르게 정의되어야 한다", () => {
    const testMessage: AnnouncementMessage = {
      party_id: "test-party-id-123",
      content: "이벤트가 곧 시작됩니다! 🎉",
      type: "info",
      created_at: new Date().toISOString(),
    };

    expect(testMessage.party_id).toBe("test-party-id-123");
    expect(testMessage.content).toContain("이벤트");
    expect(["info", "emergency", "notice"]).toContain(testMessage.type);
  });

  test("채널을 안전하게 해제할 수 있어야 한다", async () => {
    const channel = supabase.channel("test-cleanup");

    // 채널 생성 후 해제
    const result = supabase.removeChannel(channel);
    expect(result).toBeDefined();
  });
});
