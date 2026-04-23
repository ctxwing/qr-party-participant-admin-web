/**
 * Better Auth 서버 설정
 * - 관리자 ID/PWD 인증 (email + password)
 * - Supabase PostgreSQL 연동
 * 작성자: ctxwing@gmail.com
 */
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // Supabase PostgreSQL 직접 연결 (pooler)
  database: {
    type: "postgres",
    url: process.env.DATABASE_URL!,
  },

  // 이메일+패스워드 인증 (관리자 로그인용)
  emailAndPassword: {
    enabled: true,
    // 자체 가입은 비활성 (관리자 수동 등록)
    autoSignIn: true,
  },

  // 세션 설정
  session: {
    // 세션 유효 기간: 7일
    expiresIn: 60 * 60 * 24 * 7,
    // 세션 갱신 주기: 1일
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5분 캐시
    },
  },

  // 기본 URL 설정
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
});

// 타입 내보내기
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
