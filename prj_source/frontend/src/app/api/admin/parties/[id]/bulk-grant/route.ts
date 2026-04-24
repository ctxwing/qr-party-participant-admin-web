import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { type, amount } = await request.json(); // type: 'hearts' | 'cupids', amount: number
    
    if (!type || !amount) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const field = type === 'hearts' ? participants.hearts_count : participants.cupids_count;

    // 모든 참여자에게 일괄 지급 (트랜잭션 효과를 위해 단일 업데이트 쿼리 사용)
    const result = await db.update(participants)
      .set({
        [type === 'hearts' ? 'hearts_count' : 'cupids_count']: sql`${field} + ${amount}`,
        last_active: new Date(),
      })
      .where(eq(participants.party_id, id))
      .returning();

    return NextResponse.json({ 
      success: true, 
      count: result.length,
      message: `전체 참여자(${result.length}명)에게 ${type === 'hearts' ? '호감도' : '큐피트'} ${amount}회를 지급했습니다.` 
    });
  } catch (error) {
    console.error("Failed to bulk grant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
