/**
 * T002: ag-grid v35, qrcode.react, Supabase Realtime 기술 조사 테스트
 * - 패키지 import 및 기본 API 검증
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";

describe("T002: 핵심 라이브러리 기술 조사", () => {
  // === ag-grid v35 ===
  test("ag-grid-community v35+ 패키지가 정상 import 되어야 한다", async () => {
    const mod = await import("ag-grid-community");
    expect(mod.createGrid).toBeDefined();
    expect(typeof mod.createGrid).toBe("function");
  });

  test("ag-grid-react v35+ 패키지가 정상 import 되어야 한다", async () => {
    const mod = await import("ag-grid-react");
    expect(mod.AgGridReact).toBeDefined();
  });

  test("ag-grid ColDef 타입이 사용 가능해야 한다", async () => {
    const mod = await import("ag-grid-community");
    // ColDef 타입을 이용한 컬럼 정의가 가능한지 확인
    const colDef: import("ag-grid-community").ColDef = {
      field: "name",
      headerName: "파티명",
      sortable: true,
      filter: true,
    };
    expect(colDef.field).toBe("name");
    expect(colDef.headerName).toBe("파티명");
  });

  // === qrcode.react ===
  test("qrcode.react 패키지가 정상 import 되어야 한다", async () => {
    const mod = await import("qrcode.react");
    expect(mod.QRCodeSVG).toBeDefined();
    expect(mod.QRCodeCanvas).toBeDefined();
  });

  // === Supabase Realtime ===
  test("@supabase/supabase-js에서 createClient가 정상 import 되어야 한다", async () => {
    const mod = await import("@supabase/supabase-js");
    expect(mod.createClient).toBeDefined();
    expect(typeof mod.createClient).toBe("function");
  });

  test("Supabase Realtime 채널 API가 존재해야 한다", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    // 테스트용 더미 클라이언트 생성 (실제 연결 없음)
    const client = createClient(
      "https://dummy.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder"
    );
    // channel API 존재 확인
    expect(client.channel).toBeDefined();
    expect(typeof client.channel).toBe("function");

    // 채널 생성 테스트
    const channel = client.channel("test-announcements");
    expect(channel).toBeDefined();
    expect(channel.on).toBeDefined();
    expect(typeof channel.on).toBe("function");

    // 정리
    client.removeChannel(channel);
  });
});
