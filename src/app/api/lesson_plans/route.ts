import { NextRequest, NextResponse } from "next/server";
import { lessonPlanInputSchema, lessonPlanSchema } from "@/lib/schemas";
import { supabaseBrowser, supabaseServer } from "@/lib/supabase";

// GET: ดึงข้อมูลทั้งหมดพร้อม pagination และ filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  // Filter parameters
  const level = searchParams.get('level');
  const subject = searchParams.get('subject');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  try {
    let query = supabaseServer()
      .from("lesson_plans")
      .select("*", { count: 'exact' });

    // Apply filters
    if (level) {
      query = query.ilike('level', `%${level}%`);
    }
    
    if (subject) {
      query = query.ilike('subject', `%${subject}%`);
    }
    
    if (search) {
      query = query.or(`unit_name.ilike.%${search}%,subject.ilike.%${search}%,level.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (searchParams.get('pagination') !== 'false') {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return paginated response
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > offset + limit
      }
    });
    
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}

// POST: เพิ่มข้อมูลใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = lessonPlanInputSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid data", details: parse.error.issues }, { status: 400 });
    }
    const sb = supabaseBrowser();
    const { data, error } = await sb.from("lesson_plans").insert(parse.data).select("id").single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
