"use client";

import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface LessonPlan {
  id: string;
  level: string;
  subject: string;
  unit_name: string;
  objectives: string[];
  activities: string[];
  assessment: string;
  images: Array<{
    url: string;
    source?: string;
    alt?: string;
    attribution?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export default function PlanDetailPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const params = useParams() as { id: string };
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/lesson_plans/${params.id}`);
        setPlan(response.data);
      } catch (err: unknown) {
        console.error('Error fetching plan:', err);
        if ((err as any)?.response?.status === 404) {
          setError("ไม่พบแผนการสอนที่คุณต้องการ");
        } else {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlan();
    }
  }, [params.id]);

  // ปรับปรุง formatDate ให้รองรับกรณีไม่มีข้อมูลหรือข้อมูลผิดรูปแบบ
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const toThaiNumber = (num: number): string => {
  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  return num
    .toString()
    .split('')
    .map(digit => thaiDigits[parseInt(digit, 10)])
    .join('');
}

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: plan ? `แผนการสอน_${plan.unit_name}` : undefined,
    removeAfterPrint: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-4 mb-6">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-red-500 text-xl mb-4">⚠️ เกิดข้อผิดพลาด</div>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← กลับไปหน้ารายการ
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        * {
          font-family: 'Sarabun', 'Noto Sans Thai', 'Arial', sans-serif;
        }
        /* Screen styles for images */
        .image-container img {
          max-width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            font-size: 14pt;
            line-height: 1.6;
            color: #000;
          }
          #lesson-plan-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 40pt 60pt !important;
            background: white !important;
          }
          .page-break {
            page-break-before: always;
          }
          h1, h2, h3 {
            color: #000 !important;
            font-weight: bold !important;
          }
          h1 {
            font-size: 20pt;
            margin-bottom: 12pt;
            text-align: center;
          }
          h2 {
            font-size: 18pt;
            margin-bottom: 10pt;
            text-align: center;
          }
          h3 {
            font-size: 16pt;
            margin-top: 20pt;
            margin-bottom: 10pt;
          }
          img {
            max-width: 300pt !important;
            max-height: 200pt !important;
            width: auto !important;
            height: auto !important;
            border: 1px solid #ccc !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .image-container {
            text-align: center !important;
            page-break-inside: avoid !important;
            margin-bottom: 20pt !important;
            border: 1px solid #ccc !important;
            padding: 10pt !important;
          }
          .grid {
            display: block !important;
          }
          .grid > * {
            margin-bottom: 25pt !important;
            page-break-inside: avoid !important;
          }
          /* Force media section to start on new page */
          .media-section {
            page-break-before: always !important;
            margin-top: 0 !important;
          }
          /* Make metadata visible in print */
          .metadata-section {
            color: #666 !important;
            font-size: 10pt !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6 no-print">
              <Link
                href="/plan"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← กลับไปหน้ารายการแผนการสอน
              </Link>
            </nav>
            {/* Main Content */}
            <div ref={printRef} id="lesson-plan-content" className="bg-white shadow-lg overflow-hidden">
              {/* Official Header */}
              <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">แผนการจัดการเรียนรู้</h1>
                  <h2 className="text-xl font-semibold text-gray-700">{plan.unit_name}</h2>
                  <p className="text-sm text-gray-500 mt-2">เลขที่เอกสาร: {plan.id ? plan.id.substring(0, 8).toUpperCase() : 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
                  <div>
                    <p className="mb-2"><span className="font-semibold">ระดับชั้น:</span> {plan.level}</p>
                    <p className="mb-2"><span className="font-semibold">วิชา:</span> {plan.subject}</p>
                  </div>
                  <div>
                    <p className="mb-2"><span className="font-semibold">วันที่จัดทำ:</span> {formatDate(plan.created_at)}</p>
                    <p className="mb-2"><span className="font-semibold">ผู้จัดทำ:</span> ________________________</p>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Objectives */}
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    ๑. จุดประสงค์การเรียนรู้
                  </h3>
                  <div className="ml-4">
                    <ol className="space-y-2 list-none">
                      {plan.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-600 mr-3 mt-0.5 flex-shrink-0 min-w-[2rem]">
                            ๑.{toThaiNumber(index + 1)}
                          </span>
                          <span className="text-gray-700 leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>

                {/* Activities */}
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    ๒. กิจกรรมการเรียนการสอน
                  </h3>
                  <div className="ml-4">
                    <ol className="space-y-4 list-none">
                      {plan.activities.map((activity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-600 mr-3 mt-0.5 flex-shrink-0 min-w-[2rem]">
                            ๒.{toThaiNumber(index + 1)}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">{activity}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>

                {/* Assessment */}
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                    ๓. การประเมินผล
                  </h3>
                  <div className="ml-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.assessment}</p>
                  </div>
                </section>

                {/* Images */}
                {plan.images && plan.images.length > 0 && (
                  <section className="media-section">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                      ๔. สื่อการเรียนการสอน
                    </h3>
                    <div className="ml-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {plan.images.map((image, index) => (
                        <div key={index} className="image-container border border-gray-300 p-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.url}
                            alt={image.alt || `สื่อการเรียนการสอน ${index + 1}`}
                            className="w-full h-48 object-contain mb-3"
                            style={{
                              maxWidth: '300px',
                              maxHeight: '200px',
                              margin: '0 auto',
                              display: 'block'
                            }}
                          />
                          <p className="text-sm text-center text-gray-700 font-medium">
                            รูปที่ {toThaiNumber(index + 1)}: {image.alt || `สื่อการเรียนการสอน ${index + 1}`}
                          </p>
                          {image.attribution && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              ที่มา: {image.attribution}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Signature Section */}
                <section className="mt-12 pt-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <p className="mb-8">ลงชื่อ ________________________ ผู้จัดทำ</p>
                      <p>( ________________________ )</p>
                      <p className="mt-2">วันที่ _____ / _____ / _____</p>
                    </div>
                    <div className="text-center">
                      <p className="mb-8">ลงชื่อ ________________________ หัวหน้าสถานศึกษา</p>
                      <p>( ________________________ )</p>
                      <p className="mt-2">วันที่ _____ / _____ / _____</p>
                    </div>
                  </div>
                </section>

                {/* Metadata for reference only */}
                <section className="metadata-section border-t border-gray-200 pt-6 text-xs text-gray-400">
                  <div className="flex flex-wrap gap-4">
                    <span>เลขที่เอกสาร: {plan.id ? plan.id.substring(0, 8).toUpperCase() : 'N/A'}</span>
                    <span>จัดทำโดยระบบ: {formatDate(plan.created_at)}</span>
                    {plan.updated_at && plan.updated_at !== plan.created_at && (
                      <span>แก้ไขล่าสุด: {formatDate(plan.updated_at)}</span>
                    )}
                  </div>
                </section>
              </div>
              {/* Actions */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 no-print">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  {/* Navigation buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/plan"
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      ← กลับไปหน้ารายการ
                    </Link>
                    <Link
                      href="/plans"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ➕ สร้างแผนการสอนใหม่
                    </Link>
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      🖨️ พิมพ์แผนการสอน
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
