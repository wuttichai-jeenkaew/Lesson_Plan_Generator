import { NextRequest, NextResponse } from "next/server";
import { lessonPlanSchema } from "@/lib/schemas";
import { supabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("lesson_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }

  // Validate data shape
  const parse = lessonPlanSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid data", details: parse.error.issues }, { status: 400 });
  }

  return NextResponse.json(parse.data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sb = supabaseServer();
    
    // Check if the lesson plan exists
    const { data: existingPlan, error: fetchError } = await sb
      .from("lesson_plans")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: "แผนการสอนไม่พบ" }, { status: 404 });
    }

    // Delete the lesson plan
    const { error: deleteError } = await sb
      .from("lesson_plans")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: "ไม่สามารถลบแผนการสอนได้" }, { status: 500 });
    }

    return NextResponse.json({ message: "ลบแผนการสอนเรียบร้อยแล้ว" }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดที่ไม่คาดคิด" }, { status: 500 });
  }
}
