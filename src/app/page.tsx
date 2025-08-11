"use client"
import { useEffect, useState } from "react";
import axios from "axios";

type LessonPlan = {
  id?: number;
  level: string;
  subject: string;
  unit_name: string;
  objectives: string[];
  activities: string[];
  assessment: string;
  images: string; // หรือปรับเป็น images: { url: string; source: string; alt: string; attribution: string }[] ถ้าแปลง JSON
};

export default function Home() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get("http://localhost:3000/api/resson_plan")
      .then(res => {
        setPlans(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Lesson Plans</h1>
      {plans.length === 0 ? (
        <div>ไม่พบข้อมูล</div>
      ) : (
        <ul>
          {plans.map((plan, idx) => (
            <li key={plan.id || idx} style={{ marginBottom: 24, border: '1px solid #eee', padding: 16 }}>
              <h2>{plan.subject} ({plan.level})</h2>
              <strong>{plan.unit_name}</strong>
              <div>
                <b>วัตถุประสงค์:</b>
                <ul>
                  {plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </div>
              <div>
                <b>กิจกรรม:</b>
                <ul>
                  {plan.activities.map((act, i) => <li key={i}>{act}</li>)}
                </ul>
              </div>
              <div><b>การประเมิน:</b> {plan.assessment}</div>
              {/* แสดงรูปภาพถ้ามี */}
              {plan.images && (
                <div style={{ marginTop: 8 }}>
                  <b>รูปภาพ:</b>
                  {(() => {
                    let imgs: any[] = [];
                    if (typeof plan.images === "string") {
                      try {
                        imgs = JSON.parse(plan.images);
                      } catch {
                        imgs = [];
                      }
                    } else if (Array.isArray(plan.images)) {
                      imgs = plan.images;
                    }
                    return imgs.length > 0
                      ? imgs.map((img, i) => (
                          <div key={i} style={{ marginTop: 4 }}>
                            {img.url ? (
                              <img src={img.url} alt={img.alt} style={{ maxWidth: 200 }} />
                            ) : (
                              <div style={{ color: "red" }}>ไม่มี url รูปภาพ</div>
                            )}
                            <div style={{ fontSize: 12 }}>
                              ที่มา: {img.attribution} ({img.source})
                            </div>
                          </div>
                        ))
                      : <div>ไม่มีรูปภาพ</div>;
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
