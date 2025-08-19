"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonPlanInputSchema, type LessonPlanInput, type ImageItem } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function NewPlanPage() {
  const router = useRouter();

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);

  // Dropdown options
  const levelOptions = [
    { value: 'ป.1', label: 'ประถมศึกษาปีที่ 1 (ป.1)' },
    { value: 'ป.2', label: 'ประถมศึกษาปีที่ 2 (ป.2)' },
    { value: 'ป.3', label: 'ประถมศึกษาปีที่ 3 (ป.3)' },
    { value: 'ป.4', label: 'ประถมศึกษาปีที่ 4 (ป.4)' },
    { value: 'ป.5', label: 'ประถมศึกษาปีที่ 5 (ป.5)' },
    { value: 'ป.6', label: 'ประถมศึกษาปีที่ 6 (ป.6)' },
    { value: 'ม.1', label: 'มัธยมศึกษาปีที่ 1 (ม.1)' },
    { value: 'ม.2', label: 'มัธยมศึกษาปีที่ 2 (ม.2)' },
    { value: 'ม.3', label: 'มัธยมศึกษาปีที่ 3 (ม.3)' },
    { value: 'ม.4', label: 'มัธยมศึกษาปีที่ 4 (ม.4)' },
    { value: 'ม.5', label: 'มัธยมศึกษาปีที่ 5 (ม.5)' },
    { value: 'ม.6', label: 'มัธยมศึกษาปีที่ 6 (ม.6)' },
  ];

  const subjectOptions = [
    { value: 'ภาษาไทย', label: 'ภาษาไทย' },
    { value: 'คณิตศาสตร์', label: 'คณิตศาสตร์' },
    { value: 'วิทยาศาสตร์', label: 'วิทยาศาสตร์' },
    { value: 'สังคมศึกษา', label: 'สังคมศึกษา ศาสนา และวัฒนธรรม' },
    { value: 'ประวัติศาสตร์', label: 'ประวัติศาสตร์' },
    { value: 'ภาษาอังกฤษ', label: 'ภาษาอังกฤษ' },
    { value: 'สุขศึกษา', label: 'สุขศึกษาและพลศึกษา' },
    { value: 'ศิลปะ', label: 'ศิลปะ' },
    { value: 'ดนตรี', label: 'ดนตรี' },
    { value: 'การงานอาชีพ', label: 'การงานอาชีพ' },
    { value: 'คอมพิวเตอร์', label: 'เทคโนโลยี (คอมพิวเตอร์)' },
    { value: 'ภาษาจีน', label: 'ภาษาจีน' },
    { value: 'ภาษาญี่ปุ่น', label: 'ภาษาญี่ปุ่น' },
    { value: 'อื่นๆ', label: 'อื่นๆ' },
  ];

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<LessonPlanInput>({
      resolver: zodResolver(lessonPlanInputSchema),
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


  const objectives = useFieldArray({ 
    control, 
    name: "objectives" as any
  });
  const activities = useFieldArray({ 
    control, 
    name: "activities" as any
  });
  const unitName = watch("unit_name");
  const formValues = watch();

  // Calculate form completion progress
  useEffect(() => {
    const values = formValues;
    let completed = 0;
    const total = 6; // level, subject, unit_name, objectives, activities, assessment
    
    if (values.level) completed++;
    if (values.subject) completed++;
    if (values.unit_name) completed++;
    if (values.objectives?.some(obj => obj.trim())) completed++;
    if (values.activities?.some(act => act.trim())) completed++;
    if (values.assessment?.trim()) completed++;
    
    setFormProgress(Math.round((completed / total) * 100));
  }, [formValues]);

  // Auto-save to localStorage (draft)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formValues.unit_name || formValues.level || formValues.subject) {
        setAutoSaving(true);
        localStorage.setItem('lesson_plan_draft', JSON.stringify(formValues));
        setTimeout(() => setAutoSaving(false), 1000);
      }
    }, 10000);

    return () => clearTimeout(autoSaveTimer);
  }, [formValues]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('lesson_plan_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach(key => {
          if (parsed[key] && key !== 'images') {
            setValue(key as keyof LessonPlanInput, parsed[key]);
          }
        });
      } catch (error) {
        console.error('Failed to parse draft:', error);
        // Ignore invalid draft
      }
    }
  }, [setValue]);

  // Clear draft after successful submission


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
      } catch (error) {
        console.error('Failed to fetch images:', error);
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
    console.log('🚀 onSubmit called with values:', values);
    console.log('🔍 Validation check:');
    
    // ทำความสะอาดข้อมูลก่อนส่ง - ลบ empty strings ออก
    const cleanedValues = {
      ...values,
      objectives: values.objectives.filter(obj => obj.trim() !== ''),
      activities: values.activities.filter(act => act.trim() !== ''),
    };
    
    console.log('🧹 Cleaned values:', cleanedValues);
    
    // ตรวจสอบ validation ก่อนส่ง
    const validation = lessonPlanInputSchema.safeParse(cleanedValues);
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.issues);
      setSubmitStatus('error');
      setSubmitMessage(`❌ ข้อมูลไม่ถูกต้อง: ${validation.error.issues[0].message}`);
      return;
    }
    
    try {
      setSubmitStatus('loading');
      setSubmitMessage('กำลังบันทึกแผนการสอน...');
      
      console.log('📤 Sending POST request to /api/lesson_plans');
      const res = await axios.post("/api/lesson_plans", cleanedValues);
      const result = res.data;
      console.log('✅ Response received:', result);
      
      setSubmitStatus('success');
      setSubmitMessage('✅ บันทึกแผนการสอนสำเร็จ!');

      

      setTimeout(() => {
        console.log('🔄 Redirecting to:', `/plan/${result.id}`);
        router.push(`/plan/${result.id}`);
      }, 1000);
      
    } catch (error: unknown) {
      console.error('❌ Submit error:', error);
      setSubmitStatus('error');
      
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData && typeof responseData === 'object' && 'error' in responseData) {
          setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${responseData.error}`);
        } else {
          setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setSubmitMessage(`❌ เกิดข้อผิดพลาด: ${error.message}`);
      } else {
        setSubmitMessage(`❌ เกิดข้อผิดพลาด: ไม่สามารถบันทึกได้`);
      }
      
      // ล้าง error message หลัง 5 วินาที
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border">
        {/* Header with Progress */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">📚 สร้างแผนการสอนใหม่</h1>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">ความคืบหน้า</span>
              <span className="text-sm text-gray-500">{formProgress}% เสร็จสิ้น</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Auto-save Indicator */}
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
              บันทึกแบบร่างอัตโนมัติ...
            </div>
          )}
        </div>
        
        {/* Status Message */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            submitStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            submitStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {submitStatus === 'loading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <span>{submitMessage}</span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => {
          console.log('📝 Form onSubmit triggered!', e);
          e.preventDefault(); // ป้องกัน default behavior
          
          // เช็คว่า form มี error หรือไม่
          const hasErrors = Object.keys(errors).length > 0;
          console.log('🔍 Form errors:', errors);
          console.log('❌ Has errors:', hasErrors);
          
          if (hasErrors) {
            console.log('⚠️ Form has validation errors, not submitting');
            setSubmitStatus('error');
            setSubmitMessage('❌ กรุณาตรวจสอบข้อมูลให้ครบถ้วน');
            return;
          }
          
          return handleSubmit(onSubmit)(e);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                ระดับชั้น <span className="text-red-500">*</span>
              </label>
              <select className="select" {...register("level")}>
                <option value="">-- เลือกระดับชั้น --</option>
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.level && <p className="err">{errors.level.message}</p>}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                วิชา <span className="text-red-500">*</span>
              </label>
              <select className="select" {...register("subject")}>
                <option value="">-- เลือกวิชา --</option>
                {subjectOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="err">{errors.subject.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                ชื่อหน่วยการเรียนรู้ <span className="text-red-500">*</span>
              </label>
              <input 
                className="input" 
                placeholder="เช่น การบวกเลข, ประโยคและคำ, ระบบสุริยะ" 
                {...register("unit_name")}
                onFocus={() => {
                  // Show helpful tips
                  if (!unitName) {
                    setSubmitMessage('💡 เคล็ดลับ: ชื่อหน่วยที่ดีจะช่วยในการค้นหารูปภาพที่เกี่ยวข้อง');
                    setTimeout(() => setSubmitMessage(''), 3000);
                  }
                }}
              />
              {errors.unit_name && <p className="err">{errors.unit_name.message}</p>}
              
              {/* Character count */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {unitName?.length || 0} ตัวอักษร
                </span>
                {unitName && unitName.length > 3 && (
                  <span className="text-xs text-green-600">✓ ดีแล้ว</span>
                )}
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200" />
          <div>
            <label className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              🎯 จุดประสงค์การเรียนรู้ <span className="text-red-500">*</span>
              <span className="text-sm font-normal text-gray-600">({objectives.fields.length} ข้อ)</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">ระบุสิ่งที่ต้องการให้นักเรียนเรียนรู้จากบทเรียนนี้</p>
            <div className="space-y-3 mt-2">
              {objectives.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2 items-start">
                  <span className="text-gray-500 text-sm mt-3 min-w-[30px]">{i + 1}.</span>
                  <div className="flex-1">
                    <input 
                      key={f.id} 
                      className="input" 
                      placeholder={`ระบุจุดประสงค์ข้อที่ ${i + 1}`} 
                      {...register(`objectives.${i}` as const)} 
                    />
                    {/* Character count for each objective */}
                    <div className="text-xs text-gray-400 mt-1">
                      {watch(`objectives.${i}`)?.length || 0} ตัวอักษร
                    </div>
                  </div>
                  {objectives.fields.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-danger mt-1"
                      onClick={() => objectives.remove(i)}
                      title="ลบข้อนี้"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <button type="button" className="btn-success" onClick={() => objectives.append("" as any)}>
                ➕ เพิ่มจุดประสงค์
              </button>
              {objectives.fields.length >= 3 && (
                <div className="text-xs text-gray-500 flex items-center">
                  💡 คุณมีจุดประสงค์เพียงพอแล้ว
                </div>
              )}
            </div>
            {errors.objectives && <p className="err">{errors.objectives.message as string}</p>}
          </div>
          
          <div>
            <label className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              📝 กิจกรรมการเรียนการสอน <span className="text-red-500">*</span>
              <span className="text-sm font-normal text-gray-600">({activities.fields.length} ข้อ)</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">อธิบายขั้นตอนการสอนและกิจกรรมต่างๆ ที่จะดำเนินการ</p>
            <div className="space-y-3 mt-2">
              {activities.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2 items-start">
                  <span className="text-gray-500 text-sm mt-3 min-w-[30px]">{i + 1}.</span>
                  <div className="flex-1">
                    <input 
                      key={f.id} 
                      className="input" 
                      placeholder={`ระบุกิจกรรมข้อที่ ${i + 1}`} 
                      {...register(`activities.${i}` as const)} 
                    />
                    {/* Character count for each activity */}
                    <div className="text-xs text-gray-400 mt-1">
                      {watch(`activities.${i}`)?.length || 0} ตัวอักษร
                    </div>
                  </div>
                  {activities.fields.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-danger mt-1"
                      onClick={() => activities.remove(i)}
                      title="ลบข้อนี้"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <button type="button" className="btn-success" onClick={() => activities.append("" as any)}>
                ➕ เพิ่มกิจกรรม
              </button>
              {activities.fields.length >= 5 && (
                <div className="text-xs text-gray-500 flex items-center">
                  💡 คุณมีกิจกรรมหลากหลายแล้ว
                </div>
              )}
            </div>
            {errors.activities && <p className="err">{errors.activities.message as string}</p>}
          </div>
          <div>
            <label className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              📊 วิธีการประเมินผล <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">อธิบายวิธีการวัดและประเมินผลการเรียนรู้ของนักเรียน</p>
            <textarea 
              className="textarea mt-2" 
              placeholder="เช่น การทดสอบก่อนเรียน-หลังเรียน, การสังเกตพฤติกรรม, การประเมินชิ้นงาน" 
              rows={4}
              {...register("assessment")} 
            />
            {/* Character count for assessment */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {watch("assessment")?.length || 0} ตัวอักษร
              </span>
              {watch("assessment") && watch("assessment").length > 20 && (
                <span className="text-xs text-green-600">✓ รายละเอียดดีแล้ว</span>
              )}
            </div>
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <p className="err">{(errors.images as any).message ?? "กรุณาเลือกรูปอย่างน้อย 1 รูป"}</p>
            )}
          </div>
          <div className="pt-6 border-t border-gray-200">
            <button 
              className="btn-primary w-full text-lg font-semibold py-3 transition-all duration-200 hover:shadow-lg"
              disabled={submitStatus === 'loading'}
              type="submit"
              onClick={(e) => {
                console.log('🖱️ Submit button clicked!');
                const formData = watch();
                console.log('📋 Current form data:', formData);
                console.log('❌ Current errors:', errors);
                
                // เช็คว่ามีข้อมูลพื้นฐานหรือไม่
                if (!formData.level || !formData.subject || !formData.unit_name) {
                  console.log('⚠️ Missing required basic fields');
                  setSubmitStatus('error');
                  setSubmitMessage('❌ กรุณากรอกข้อมูลพื้นฐาน: ระดับชั้น, วิชา, และชื่อหน่วยการเรียนรู้');
                  e.preventDefault();
                  return;
                }
                
                // เช็คจุดประสงค์
                const validObjectives = formData.objectives?.filter(obj => obj && obj.trim() !== '') || [];
                if (validObjectives.length === 0) {
                  console.log('⚠️ No valid objectives');
                  setSubmitStatus('error');
                  setSubmitMessage('❌ กรุณาเพิ่มจุดประสงค์การเรียนรู้อย่างน้อย 1 ข้อ');
                  e.preventDefault();
                  return;
                }
                
                // เช็คกิจกรรม
                const validActivities = formData.activities?.filter(act => act && act.trim() !== '') || [];
                if (validActivities.length === 0) {
                  console.log('⚠️ No valid activities');
                  setSubmitStatus('error');
                  setSubmitMessage('❌ กรุณาเพิ่มกิจกรรมการเรียนการสอนอย่างน้อย 1 ข้อ');
                  e.preventDefault();
                  return;
                }
                
                // เช็คการประเมินผล
                if (!formData.assessment || formData.assessment.trim() === '') {
                  console.log('⚠️ No assessment');
                  setSubmitStatus('error');
                  setSubmitMessage('❌ กรุณากรอกวิธีการประเมินผล');
                  e.preventDefault();
                  return;
                }
                
                console.log('✅ All validation passed, ready to submit');
              }}
            >
              {submitStatus === 'loading' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </div>
              ) : (
                "💾 บันทึกแผนการสอน"
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              💡 ระบบจะบันทึกข้อมูลและพาคุณไปยังหน้าแสดงผลแผนการสอนที่สร้างเสร็จแล้ว
            </p>
            
      
          </div>
        </form>
      </div>
      <style jsx global>{`
        .input, .select { 
          width: 100%; 
          border: 1px solid #e5e7eb; 
          border-radius: 0.5rem; 
          padding: 0.75rem 1rem; 
          background: white; 
          transition: all 0.2s;
        }
        .input:focus, .select:focus { 
          outline: none; 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
        }
        .textarea { 
          width: 100%; 
          min-height: 120px; 
          border: 1px solid #e5e7eb; 
          border-radius: 0.5rem; 
          padding: 0.75rem 1rem; 
          background: white; 
          resize: vertical;
          transition: all 0.2s;
        }
        .textarea:focus {
          outline: none; 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
        }
        .btn, .btn-primary, .btn-success, .btn-danger { 
          padding: 0.5rem 1rem; 
          border-radius: 0.5rem; 
          border: 1px solid #e5e7eb; 
          transition: all 0.2s; 
          font-weight: 500;
          cursor: pointer;
          display: inline-block;
          width: 35%;

        }
        .btn-primary { 
          background: #2563eb !important; 
          color: white !important; 
          border: none !important; 
          width: 100% !important;
          cursor: pointer !important;
          display: block !important;
        }
        .btn-success { 
          background: #10b981; 
          color: white; 
          border: none; 
        }
        .btn-danger { 
          background: #ef4444; 
          color: white; 
          border: none; 
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        .btn:hover { 
          background: #f3f4f6; 
        }
        .btn-primary:hover:not(:disabled) { 
          background: #1d4ed8; 
        }
        .btn-success:hover { 
          background: #059669; 
        }
        .btn-danger:hover { 
          background: #dc2626; 
        }
        .err { 
          color: #dc2626; 
          font-size: 0.875rem; 
          margin-top: 0.25rem; 
        }
      `}</style>
    </div>
  );
}