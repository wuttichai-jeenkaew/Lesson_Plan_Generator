"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonPlanSchema, type LessonPlanInput, type ImageItem } from "@/lib/schemas";
import { supabaseBrowser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function NewPlanPage() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<LessonPlanInput>({
      resolver: zodResolver(lessonPlanSchema),
      defaultValues: {
        level: "",
        subject: "",
        unit_name: "",
        objectives: [""],
        activities: [""],
        assessment: "",
        images: [],
      },
    });


  const objectives = useFieldArray({ control, name: "objectives" as any });
  const activities = useFieldArray({ control, name: "activities" as any });
  const unitName = watch("unit_name");

  const [imageResults, setImageResults] = useState<ImageItem[]>([]);
  const [loadingImg, setLoadingImg] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    (watch("images")?.[0]?.url as string) ?? null
  );

  // ดึงรูปแบบ debounce เมื่อกรอก unit_name
  useEffect(() => {
    if (!unitName || unitName.trim().length < 2) return;
    const id = setTimeout(async () => {
      try {
        setLoadingImg(true);
        const r = await axios.get(`/api/images?query=${encodeURIComponent(unitName)}`);
        setImageResults(r.data.images ?? []);
      } catch (e) {
        setImageResults([]);
      } finally {
        setLoadingImg(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [unitName]);

  // sync selectedUrl กับค่าฟอร์ม
  useEffect(() => {
    const url = (watch("images")?.[0]?.url as string) ?? null;
    setSelectedUrl(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickImage(img: ImageItem) {
    setValue("images", [img], { shouldValidate: true });
    setSelectedUrl(img.url);
  }

  function unpickImage() {
    setValue("images", [], { shouldValidate: true });
    setSelectedUrl(null);
  }

  async function onSubmit(values: LessonPlanInput) {
    try {
      const res = await axios.post("/api/lesson_plans", values);
      const result = res.data;
      router.push(`/create_plan/${result.id}`);
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.error) {
        alert(e.response.data.error);
      } else {
        alert(e.message || "เกิดข้อผิดพลาด");
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">สร้างแผนการสอน</h1>
  <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">ระดับชั้น</label>
              <input className="input" placeholder="เช่น ป.1, ม.2" {...register("level")} />
              {errors.level && <p className="err">{errors.level.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">วิชา</label>
              <input className="input" placeholder="เช่น คณิตศาสตร์" {...register("subject")} />
              {errors.subject && <p className="err">{errors.subject.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">ชื่อหน่วย (unit_name)</label>
              <input className="input" placeholder="เช่น การบวกเลข" {...register("unit_name")} />
              {errors.unit_name && <p className="err">{errors.unit_name.message}</p>}
            </div>
          </div>
          <hr className="my-2 border-gray-200" />
          <div>
            <label className="font-semibold text-lg text-gray-800">🎯 จุดประสงค์</label>
            <div className="space-y-2 mt-2">
              {objectives.fields.map((f, i) => (
                <input key={f.id} className="input" placeholder={`ข้อที่ ${i + 1}`} {...register(`objectives.${i}` as const)} />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" className="btn" onClick={() => objectives.append("" as any)}>+ เพิ่มข้อ</button>
              {objectives.fields.length > 1 && (
                <button type="button" className="btn" onClick={() => objectives.remove(objectives.fields.length - 1)}>– ลบข้อท้าย</button>
              )}
            </div>
            {errors.objectives && <p className="err">{errors.objectives.message as string}</p>}
          </div>
          <div>
            <label className="font-semibold text-lg text-gray-800">📝 กิจกรรม</label>
            <div className="space-y-2 mt-2">
              {activities.fields.map((f, i) => (
                <input key={f.id} className="input" placeholder={`ข้อที่ ${i + 1}`} {...register(`activities.${i}` as const)} />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" className="btn" onClick={() => activities.append("" as any)}>+ เพิ่มข้อ</button>
              {activities.fields.length > 1 && (
                <button type="button" className="btn" onClick={() => activities.remove(activities.fields.length - 1)}>– ลบข้อท้าย</button>
              )}
            </div>
            {errors.activities && <p className="err">{errors.activities.message as string}</p>}
          </div>
          <div>
            <label className="font-semibold text-lg text-gray-800">📊 วิธีประเมิน</label>
            <textarea className="textarea mt-2" placeholder="รายละเอียดวิธีประเมิน" {...register("assessment")} />
            {errors.assessment && <p className="err">{errors.assessment.message}</p>}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800">🖼️ รูปที่แนะนำจากคำว่า:</span>
              <em className="text-blue-700">{unitName || "-"}</em>
              {loadingImg && <span className="text-xs text-gray-500">กำลังค้นรูป…</span>}
            </div>

            {/* Skeleton ระหว่างโหลด */}
            {loadingImg && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty state เมื่อไม่มีรูป */}
            {!loadingImg && unitName && imageResults.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                ไม่พบรูปที่เกี่ยวข้อง ลองเปลี่ยนคำค้นหรือสะกดใหม่ดูนะครับ
              </p>
            )}

            {/* กริดรูป */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {imageResults.map((img, idx) => {
                const active = selectedUrl === img.url;
                return (
                  <button
                    type="button"
                    key={idx}
                    className={
                      "relative border rounded-lg overflow-hidden transition focus:outline-none focus:ring-2 focus:ring-blue-500 " +
                      (active ? "ring-2 ring-blue-600" : "hover:ring-2 hover:ring-blue-300")
                    }
                    onClick={() => pickImage(img)}
                    title={active ? "เลือกแล้ว" : "เลือกภาพนี้"}
                    aria-pressed={active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt} className="w-full h-32 object-cover" />
                    <div className="p-1 text-[11px] text-gray-600 bg-white/80">{img.attribution}</div>
                    {active && (
                      <span className="absolute top-1 right-1 bg-white/90 text-[10px] px-1.5 py-0.5 rounded shadow">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ปุ่มยกเลิกการเลือก */}
            {selectedUrl && (
              <div className="mt-2">
                <button type="button" className="btn" onClick={unpickImage}>
                  ยกเลิกการเลือกภาพ
                </button>
              </div>
            )}

            {/* คำอธิบายเครดิต */}
            <p className="text-xs text-gray-600 mt-2">
              * รูปภาพมาจาก Unsplash/Pixabay โปรดระบุเครดิตเมื่อใช้งานในเอกสาร
            </p>

            {/* ถ้าบังคับต้องมีรูป ให้โชว์ error */}
            {errors.images && (
              <p className="err">{(errors.images as any).message ?? "กรุณาเลือกรูปอย่างน้อย 1 รูป"}</p>
            )}
          </div>
          <div className="pt-4">
            <button className="btn-primary w-full text-lg font-semibold py-3" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก…" : "บันทึกแผนการสอน"}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        .input { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.6rem 0.8rem; background:white; }
        .textarea { width:100%; min-height:120px; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.6rem 0.8rem; background:white; }
        .btn, .btn-primary { padding:0.5rem 0.8rem; border-radius:0.5rem; border:1px solid #e5e7eb; transition:background 0.2s; }
        .btn-primary { background:#2563eb; color:white; border:none; }
        .btn:hover { background:#f3f4f6; }
        .btn-primary:hover { background:#1d4ed8; }
        .err { color:#dc2626; font-size:0.875rem; margin-top:0.25rem; }
      `}</style>
    </div>
  );
}