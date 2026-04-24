import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { 
  interactions, 
  messages, 
  nicknameLogs, 
  announcements,
  participants,
  parties
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 모든 활동을 통합하여 최신순으로 조회
    // 1. 상호작용 (호감도/큐피트)
    const interactionList = await db.select({
      id: interactions.id,
      party_id: interactions.party_id,
      sender_id: interactions.sender_id,
      receiver_id: interactions.receiver_id,
      type: interactions.type,
      created_at: interactions.created_at,
    })
    .from(interactions)
    .orderBy(desc(interactions.created_at))
    .limit(50);

    // 2. 쪽지
    const messageList = await db.select({
      id: messages.id,
      party_id: messages.party_id,
      sender_id: messages.sender_id,
      receiver_id: messages.receiver_id,
      content: messages.content,
      created_at: messages.created_at,
    })
    .from(messages)
    .orderBy(desc(messages.created_at))
    .limit(50);

    // 3. 닉네임 변경
    const nicknameList = await db.select()
    .from(nicknameLogs)
    .orderBy(desc(nicknameLogs.created_at))
    .limit(20);

    // 4. 공지
    const announcementList = await db.select()
    .from(announcements)
    .orderBy(desc(announcements.created_at))
    .limit(10);

    // 데이터 가공 및 통합
    const activities = [
      ...interactionList.map(i => ({ ...i, category: "interaction" })),
      ...messageList.map(m => ({ ...m, category: "message" })),
      ...nicknameList.map(n => ({ ...n, category: "nickname" })),
      ...announcementList.map(a => ({ ...a, category: "announcement" })),
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
