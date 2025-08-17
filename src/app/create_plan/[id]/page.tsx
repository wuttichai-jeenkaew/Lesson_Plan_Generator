"use client";

import { useEffect, useState } from "react";
import { lessonPlanSchema, type LessonPlanInput } from "@/lib/schemas";
import Link from "next/link";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";


export default function PlanDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [plan, setPlan] = useState<LessonPlanInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/lesson_plans/${params.id}`)
      .then(res => setPlan(res.data))
      .catch(e => setError("ไม่พบข้อมูลหรือเกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบแผนการสอนนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/lesson_plans/${params.id}`);
      alert('ลบแผนการสอนเรียบร้อยแล้ว');
      router.push('/plan');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('เกิดข้อผิดพลาดในการลบแผนการสอน');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (error || !plan) return <div className="max-w-2xl mx-auto p-8 text-center text-red-500">{error || "ไม่พบข้อมูล"}</div>;



  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          #lesson-plan-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20pt !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          h1 {
            font-size: 18pt;
            margin-bottom: 10pt;
          }
          
          h2 {
            font-size: 14pt;
            margin-top: 15pt;
            margin-bottom: 8pt;
          }
          
          img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
      
      <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/plan" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          ← กลับไปหน้ารายการแผนการสอน
        </Link>
        <div className="flex gap-3 no-print">
          <Link
            href={`/plans?edit=${params.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            ✏️ แก้ไข
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🖨️ พิมพ์
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                กำลังลบ...
              </>
            ) : (
              <>
                🗑️ ลบ
              </>
            )}
          </button>

        </div>
      </div>
      <div id="lesson-plan-content" className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-3xl font-extrabold text-gray-900">{plan.unit_name}</h1>
          <div className="text-gray-600 text-sm md:text-base">
            <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-2">ระดับชั้น: <b>{plan.level}</b></span>
            <span className="inline-block bg-gray-100 rounded px-2 py-1">วิชา: <b>{plan.subject}</b></span>
          </div>
        </div>
        <hr className="my-2 border-gray-200" />
        <section>
          <h2 className="font-semibold text-lg mb-1 text-gray-800">🎯 จุดประสงค์</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            {plan.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-1 text-gray-800">📝 กิจกรรม</h2>
          <ol className="list-decimal ml-6 text-gray-700 space-y-1">
            {plan.activities.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="font-semibold text-lg mb-1 text-gray-800">📊 วิธีประเมิน</h2>
          <div className="bg-gray-50 rounded p-3 text-gray-700 border border-gray-100">{plan.assessment}</div>
        </section>
        {plan.images.length > 0 && (
          <section>
            <h2 className="font-semibold text-lg mb-1 text-gray-800">🖼️ รูปภาพประกอบ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {plan.images.map((img, idx) => (
                <figure key={idx} className="border rounded-lg overflow-hidden bg-gray-50 flex flex-col h-full shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="w-full h-40 object-cover" />
                  {img.attribution && (
                    <figcaption className="p-2 text-[11px] text-gray-500 border-t bg-white">{img.attribution}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
        
        {/* Metadata Section */}
        <section className="border-t border-gray-200 pt-4 mt-6">
          <h2 className="font-semibold text-lg mb-3 text-gray-800">📋 ข้อมูลเพิ่มเติม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <span className="font-medium text-blue-800">🆔 รหัสแผนการสอน:</span>
              <div className="text-blue-700 mt-1 font-mono">{params.id}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <span className="font-medium text-green-800">📊 สถิติ:</span>
              <div className="text-green-700 mt-1">
                <div>จุดประสงค์: {plan.objectives.length} ข้อ</div>
                <div>กิจกรรม: {plan.activities.length} กิจกรรม</div>
                <div>ภาพประกอบ: {plan.images.length} รูป</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
