import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = supabaseServer();
    
    // Test connection and permissions
    const { data, error, count } = await sb
      .from("lesson_plans")
      .select("id, unit_name", { count: 'exact' });
    
    console.log('Test query result:', { data, error, count });
    
    if (error) {
      return NextResponse.json({ 
        error: error.message, 
        details: error,
        connected: false 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Connection successful",
      count,
      sample: data?.slice(0, 3),
      connected: true 
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: "Connection failed", 
      details: error,
      connected: false 
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sb = supabaseServer();
    
    // Get first lesson plan to test delete
    const { data: plans, error: fetchError } = await sb
      .from("lesson_plans")
      .select("id, unit_name")
      .limit(1);
    
    if (fetchError || !plans || plans.length === 0) {
      return NextResponse.json({ 
        error: "No plans found to test delete", 
        fetchError 
      }, { status: 404 });
    }

    const testPlan = plans[0];
    console.log('Testing delete permissions on plan:', testPlan);
    
    // Test delete permissions (but don't actually delete)
    const { error: deleteError } = await sb
      .from("lesson_plans")
      .delete()
      .eq("id", "non-existent-id"); // Use fake ID so nothing gets deleted
    
    return NextResponse.json({ 
      message: "Delete permissions test",
      canDelete: !deleteError,
      deleteError: deleteError?.message,
      testPlan
    });
  } catch (error) {
    console.error('Delete test error:', error);
    return NextResponse.json({ 
      error: "Delete test failed", 
      details: error 
    }, { status: 500 });
  }
}
