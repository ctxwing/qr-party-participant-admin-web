/**
 * Better Auth 클라이언트 설정
 * - 브라우저 측 인증 API 호출에 사용
 * 작성자: ctxwing@gmail.com
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:58100",
});

// 편의 함수 내보내기
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
