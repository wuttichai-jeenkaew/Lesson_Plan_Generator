import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabase"; // ปรับ path ตามจริง

export async function GET() {
  // ดึงข้อมูลจากตาราง lesson_plans
  const { data, error } = await supabaseServer()
    .from("lesson_plans")
    .select("*");

  if (error) {
    // กรณี error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ส่งข้อมูลกลับในรูปแบบ JSON
  return NextResponse.json(data);
}