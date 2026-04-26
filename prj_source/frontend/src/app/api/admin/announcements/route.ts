import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { party_id, content, type } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        party_id: party_id || null,
        content,
        type: type || "info",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create announcement:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
