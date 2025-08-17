"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  created_at: string;
  updated_at: string;
}

export default function PlanDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
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
      } catch (err: any) {
        console.error('Error fetching plan:', err);
        if (err.response?.status === 404) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  

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
          <div id="lesson-plan-content" className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <h1 className="text-3xl font-bold mb-4">{plan.unit_name}</h1>
              <div className="flex flex-wrap gap-4 text-blue-100">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                  📚 ระดับ: {plan.level}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                  📖 วิชา: {plan.subject}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                  📅 สร้างเมื่อ: {formatDate(plan.created_at)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Objectives */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  🎯 จุดประสงค์การเรียนรู้
                </h2>
                <div className="bg-blue-50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {plan.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm rounded-full mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Activities */}
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📝 กิจกรรมการเรียนการสอน
                </h2>
                <div className="bg-green-50 rounded-lg p-6">
                  <ol className="space-y-4">
                    {plan.activities.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white font-semibold rounded-full mr-4 mt-0.5 flex-shrink-0">
                          {index + 1}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  📊 การประเมินผล
                </h2>
                <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-400">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{plan.assessment}</p>
                </div>
              </section>

              {/* Images */}
              {plan.images && plan.images.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    🖼️ สื่อการเรียนการสอน
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plan.images.map((image, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={image.alt || `สื่อการเรียนการสอน ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        {image.attribution && (
                          <div className="p-3">
                            <p className="text-xs text-gray-500">
                              📷 {image.attribution}
                            </p>
                            {image.source && (
                              <p className="text-xs text-gray-400 mt-1">
                                แหล่งที่มา: {image.source}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Metadata */}
              <section className="border-t border-gray-200 pt-6">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>🆔 ID: {plan.id}</span>
                  <span>📅 สร้างเมื่อ: {formatDate(plan.created_at)}</span>
                  {plan.updated_at !== plan.created_at && (
                    <span>✏️ แก้ไขล่าสุด: {formatDate(plan.updated_at)}</span>
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
                    onClick={() => window.print()}
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
