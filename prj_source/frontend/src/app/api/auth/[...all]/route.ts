/**
 * Better Auth API Route Handler
 * - Next.js App Router 전용
 * - /api/auth/* 경로의 모든 인증 요청을 Better Auth에 위임
 * 작성자: ctxwing@gmail.com
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth);

export async function GET(request: Request) {
  try {
    return await originalGET(request);
  } catch (e: any) {
    console.error("BETTER AUTH GET ERROR:", e);
    return new Response(e.message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return await originalPOST(request);
  } catch (e: any) {
    console.error("BETTER AUTH POST ERROR:", e, e.stack);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
  }
}
