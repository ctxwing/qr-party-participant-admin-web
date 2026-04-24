import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // 해당 파티의 참여자 목록 조회
    const partyParticipants = await db.select()
      .from(participants)
      .where(eq(participants.party_id, id))
      .orderBy(desc(participants.created_at));

    return NextResponse.json({ data: partyParticipants });
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
