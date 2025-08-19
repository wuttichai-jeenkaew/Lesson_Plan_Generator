import { z } from "zod";

export const imageItemSchema = z.object({
  url: z.string().url(),
  source: z.string().optional(),
  alt: z.string().optional(),
  attribution: z.string().optional(),
});

// Schema สำหรับการสร้างแผนการสอนใหม่ (ไม่ต้องมี id, created_at, updated_at)
export const lessonPlanInputSchema = z.object({
  level: z.string().min(1, "กรุณากรอกระดับชั้น"),
  subject: z.string().min(1, "กรุณากรอกวิชา"),
  unit_name: z.string().min(1, "กรุณากรอกชื่อหน่วย"),
  objectives: z.array(z.string().min(1)).min(1, "กรุณาเพิ่มจุดประสงค์อย่างน้อย 1 ข้อ"),
  activities: z.array(z.string().min(1)).min(1, "กรุณาเพิ่มกิจกรรมอย่างน้อย 1 ข้อ"),
  assessment: z.string().min(1, "กรุณากรอกวิธีประเมิน"),
  images: z.array(imageItemSchema),
});

// Schema สำหรับข้อมูลแผนการสอนที่สมบูรณ์ (มี id, created_at, updated_at)
export const lessonPlanSchema = lessonPlanInputSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type LessonPlanInput = z.infer<typeof lessonPlanInputSchema>;
export type LessonPlan = z.infer<typeof lessonPlanSchema>;
export type ImageItem = z.infer<typeof imageItemSchema>;