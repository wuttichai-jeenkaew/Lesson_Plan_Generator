/**
 * Script to check and create Supabase RLS policies for lesson_plans table
 * Run this in Supabase SQL Editor
 */

-- First, check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'lesson_plans';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'lesson_plans';

-- If no DELETE policy exists, create one (adjust according to your needs)
-- This example allows all users to delete (adjust for your security requirements)
/*
CREATE POLICY "Enable delete for all users" ON "public"."lesson_plans"
AS PERMISSIVE FOR DELETE
TO public
USING (true);
*/

-- Alternative: If you want to restrict delete to authenticated users only
/*
CREATE POLICY "Enable delete for authenticated users only" ON "public"."lesson_plans"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
*/

-- To see the current table structure and permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'lesson_plans';

-- Check if the table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lesson_plans'
ORDER BY ordinal_position;
