/**
 * T001: Better Auth 연동 Smoke 테스트
 * - Better Auth 모듈 로딩 및 기본 설정 검증
 * - 타입 추론 정상 동작 확인
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";

describe("T001: Better Auth 연동 검증", () => {
  test("better-auth 패키지가 정상적으로 import 되어야 한다", async () => {
    const mod = await import("better-auth");
    expect(mod.betterAuth).toBeDefined();
    expect(typeof mod.betterAuth).toBe("function");
  });

  test("better-auth/react 클라이언트가 정상적으로 import 되어야 한다", async () => {
    const mod = await import("better-auth/react");
    expect(mod.createAuthClient).toBeDefined();
    expect(typeof mod.createAuthClient).toBe("function");
  });

  test("better-auth/next-js 핸들러가 정상적으로 import 되어야 한다", async () => {
    const mod = await import("better-auth/next-js");
    expect(mod.toNextJsHandler).toBeDefined();
    expect(typeof mod.toNextJsHandler).toBe("function");
  });

  test("betterAuth 인스턴스 생성이 가능해야 한다 (메모리 DB)", async () => {
    const { betterAuth } = await import("better-auth");
    
    // 메모리 DB로 인스턴스 생성 테스트
    const testAuth = betterAuth({
      emailAndPassword: {
        enabled: true,
      },
      secret: "test-secret-for-smoke-test-only",
      baseURL: "http://localhost:3000",
    });

    expect(testAuth).toBeDefined();
    expect(testAuth.api).toBeDefined();
    expect(testAuth.api.getSession).toBeDefined();
  });
});
