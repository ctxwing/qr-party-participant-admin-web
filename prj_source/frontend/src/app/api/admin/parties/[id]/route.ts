import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq, and, ne } from "drizzle-orm";
import { transitionParty, PartyStatus } from "@/lib/party-lifecycle";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const party = await db.select().from(parties).where(eq(parties.id, id));
    
    if (party.length === 0) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    return NextResponse.json({ data: party[0] });
  } catch (error) {
    console.error("Failed to fetch party:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    // 현재 파티 정보 조회
    const existingParties = await db.select().from(parties).where(eq(parties.id, id));
    if (existingParties.length === 0) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }
    
    const partyToUpdate = existingParties[0];
    
    // 상태 변경 요청이 있는 경우 비즈니스 로직 검증
    if (body.status && body.status !== partyToUpdate.status) {
      // 모든 활성 파티 목록 조회 (중복 URL 검증용)
      const allParties = await db.select().from(parties);
      
      const transitionResult = transitionParty(
        // DB 스키마 타입을 Party 인터페이스에 맞게 캐스팅
        partyToUpdate as any, 
        body.status as PartyStatus, 
        allParties as any[]
      );
      
      if (!transitionResult.success) {
        return NextResponse.json({ error: transitionResult.error }, { status: 400 });
      }
    }
    
    // 시간 유효성 검증 (시간이 변경되는 경우)
    if (body.start_at || body.end_at) {
      const newStart = body.start_at ? new Date(body.start_at) : partyToUpdate.start_at;
      const newEnd = body.end_at ? new Date(body.end_at) : partyToUpdate.end_at;
      
      if (newEnd <= newStart) {
        return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
      }
    }

    const updatedData = {
      ...body,
      updated_at: new Date(),
    };

    // start_at, end_at 문자열을 Date로 변환
    if (updatedData.start_at) updatedData.start_at = new Date(updatedData.start_at);
    if (updatedData.end_at) updatedData.end_at = new Date(updatedData.end_at);

    const updatedParty = await db.update(parties)
      .set(updatedData)
      .where(eq(parties.id, id))
      .returning();

    return NextResponse.json({ data: updatedParty[0] });
  } catch (error) {
    console.error("Failed to update party:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    // 진행 중(active)이거나 완료된(completed) 파티는 삭제 불가 정책 적용 가능 (여기서는 우선 진행 중만 막음)
    const existingParties = await db.select().from(parties).where(eq(parties.id, id));
    if (existingParties.length > 0 && existingParties[0].status === "active") {
      return NextResponse.json({ error: "Cannot delete an active party" }, { status: 400 });
    }
    
    await db.delete(parties).where(eq(parties.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete party:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
