import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { desc, eq } from "drizzle-orm";

// 파티 목록 조회
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allParties = await db.select().from(parties).orderBy(desc(parties.created_at));
    return NextResponse.json({ data: allParties });
  } catch (error) {
    console.error("Failed to fetch parties:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 새 파티 생성
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, start_at, end_at, max_participants, qr_anchor_url } = body;

    if (!name || !start_at || !end_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (new Date(end_at) <= new Date(start_at)) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    const newParty = await db.insert(parties).values({
      name,
      description,
      start_at: new Date(start_at),
      end_at: new Date(end_at),
      max_participants: max_participants || 0,
      qr_anchor_url,
      status: "draft",
    }).returning();

    return NextResponse.json({ data: newParty[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to create party:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
