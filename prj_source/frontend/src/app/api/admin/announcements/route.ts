import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { announcements } from "../../../../../../database/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화 (브로드캐스트용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// 브로드캐스트는 RLS에 구애받지 않기 위해 가능하면 Service Role Key 사용이 좋으나, ANON KEY로도 발송 가능합니다.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { party_id, content, type } = body;

    if (!party_id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // DB에 공지 저장
    const newAnnouncement = await db.insert(announcements).values({
      party_id,
      content,
      type: type || "info",
    }).returning();

    const announcementData = newAnnouncement[0];

    // Supabase Realtime을 통한 브로드캐스트 발송
    if (supabase) {
      const channel = supabase.channel(`party-${party_id}`);
      await channel.send({
        type: "broadcast",
        event: "new-announcement",
        payload: announcementData,
      });
      // 발송 완료 후 채널 정리 (옵션)
      supabase.removeChannel(channel);
    }

    return NextResponse.json({ data: announcementData }, { status: 201 });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
