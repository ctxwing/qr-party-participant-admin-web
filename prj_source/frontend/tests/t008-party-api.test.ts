/**
 * T008: 파티 CRUD API 로직 검증 테스트
 * - Next.js Request/Response 구조 모의 검증
 * - 상태 변경 및 비즈니스 로직(T006 재사용) 호출 확인
 * 작성자: ctxwing@gmail.com
 */
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres";

import { describe, test, expect, mock } from "bun:test";

// mock better-auth to prevent adapter error during module evaluation
mock.module("better-auth", () => ({
  betterAuth: () => ({
    api: { getSession: async () => ({ user: { id: "admin-123" } }) },
    handler: () => {},
  })
}));

import { GET, POST } from "../src/app/api/admin/parties/route";
import { PATCH, DELETE } from "../src/app/api/admin/parties/[id]/route";

// mock auth middleware
mock.module("@/lib/auth-middleware", () => ({
  requireAdmin: async () => ({ user: { id: "admin-123" } }), // 인증 성공 모의
}));

// mock auth
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: async () => ({ user: { id: "admin-123" } }) } }
}));

// mock db
mock.module("@/lib/db", () => {
  const dummyParties = [
    {
      id: "test-party-1",
      name: "테스트 파티",
      status: "draft",
      start_at: new Date(),
      end_at: new Date(Date.now() + 3600000),
      qr_anchor_url: "https://example.com/qr",
    }
  ];

  const createThenable = (data: any[]) => {
    const clone = data.map(item => ({...item}));
    const promise = Promise.resolve(clone);
    return Object.assign(promise, {
      orderBy: () => Promise.resolve(clone),
      where: () => Promise.resolve(clone),
    });
  };

  return {
    db: {
      select: () => ({
        from: () => createThenable(dummyParties),
      }),
      insert: () => ({
        values: (data: any) => ({
          returning: () => Promise.resolve([{ ...data, id: "new-party-id" }]),
        }),
      }),
      update: () => ({
        set: (data: any) => ({
          where: () => ({
            returning: () => Promise.resolve([{ ...dummyParties[0], ...data }]),
          }),
        }),
      }),
      delete: () => ({
        where: () => Promise.resolve([{ id: "test-party-1" }]),
      }),
    },
  };
});

describe("T008: 파티 CRUD API 라우트 검증", () => {
  test("GET /api/admin/parties: 목록 조회가 성공해야 한다", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
  });

  test("POST /api/admin/parties: 정상 데이터로 파티 생성이 가능해야 한다", async () => {
    const req = new Request("http://localhost/api/admin/parties", {
      method: "POST",
      body: JSON.stringify({
        name: "새로운 파티",
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        max_participants: 50,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe("new-party-id");
    expect(json.data.status).toBe("draft"); // 기본값 draft
  });

  test("POST /api/admin/parties: 필수 값이 누락되면 400 에러를 반환해야 한다", async () => {
    const req = new Request("http://localhost/api/admin/parties", {
      method: "POST",
      body: JSON.stringify({
        name: "이름만 있는 파티",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test("PATCH /api/admin/parties/[id]: 파티 정보 수정이 가능해야 한다", async () => {
    const req = new Request("http://localhost/api/admin/parties/test-party-1", {
      method: "PATCH",
      body: JSON.stringify({
        name: "수정된 파티 이름",
        status: "active",
      }),
    });
    // params mock
    const params = Promise.resolve({ id: "test-party-1" });
    const res = await PATCH(req, { params });
    
    // 내부적으로 transitionParty에서 에러가 발생하면 400 반환, 모의 로직에 따라 성공하면 200
    // 여기서는 db.select().from(parties)가 dummyParties(draft)를 반환하므로 draft -> active 성공함
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe("수정된 파티 이름");
    expect(json.data.status).toBe("active");
  });

  test("DELETE /api/admin/parties/[id]: 파티 삭제가 가능해야 한다", async () => {
    const req = new Request("http://localhost/api/admin/parties/test-party-1", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "test-party-1" });
    const res = await DELETE(req, { params });
    if (res.status !== 200) {
      console.log(await res.json());
    }
    expect(res.status).toBe(200);
  });
});
