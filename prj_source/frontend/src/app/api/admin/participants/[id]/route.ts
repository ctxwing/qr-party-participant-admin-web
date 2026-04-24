import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    // 허용된 필드만 업데이트
    const { status, hearts_count, cupids_count, nickname } = body;
    
    const updatedParticipant = await db.update(participants)
      .set({
        ...(status && { status }),
        ...(hearts_count !== undefined && { hearts_count }),
        ...(cupids_count !== undefined && { cupids_count }),
        ...(nickname && { nickname }),
        last_active: new Date(),
      })
      .where(eq(participants.id, id))
      .returning();

    if (updatedParticipant.length === 0) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedParticipant[0] });
  } catch (error) {
    console.error("Failed to update participant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
