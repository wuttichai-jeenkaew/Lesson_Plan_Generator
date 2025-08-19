import { z } from "zod";
import { id } from "zod/locales";

export const imageItemSchema = z.object({
  url: z.string().url(),
  source: z.string().optional(),
  alt: z.string().optional(),
  attribution: z.string().optional(),
});

export const lessonPlanSchema = z.object({
  id: z.string().uuid(),
  level: z.string().min(1, "กรุณากรอกระดับชั้น"),
  subject: z.string().min(1, "กรุณากรอกวิชา"),
  unit_name: z.string().min(1, "กรุณากรอกชื่อหน่วย"),
  objectives: z.array(z.string().min(1)).min(1, "กรุณาเพิ่มจุดประสงค์อย่างน้อย 1 ข้อ"),
  activities: z.array(z.string().min(1)).min(1, "กรุณาเพิ่มกิจกรรมอย่างน้อย 1 ข้อ"),
  assessment: z.string().min(1, "กรุณากรอกวิธีประเมิน"),
  images: z.array(imageItemSchema),
  created_at: z.string().optional(), // ทำให้ optional
  updated_at: z.string().optional(), // ทำให้ optional
});

export type LessonPlanInput = z.infer<typeof lessonPlanSchema>;
export type ImageItem = z.infer<typeof imageItemSchema>;