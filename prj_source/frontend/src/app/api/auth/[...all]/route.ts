/**
 * Better Auth API Route Handler
 * - Next.js App Router 전용
 * - /api/auth/* 경로의 모든 인증 요청을 Better Auth에 위임
 * 작성자: ctxwing@gmail.com
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
