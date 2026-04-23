/**
 * 관리자 인증 미들웨어 유틸리티
 * - 서버 컴포넌트 및 API Route에서 관리자 세션 검증에 사용
 * 작성자: ctxwing@gmail.com
 */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * 현재 요청의 세션을 가져옵니다.
 * 서버 컴포넌트 또는 API Route에서 사용합니다.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * 관리자 인증 여부를 확인합니다.
 * 인증되지 않은 경우 null을 반환합니다.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
