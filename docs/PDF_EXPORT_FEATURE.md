# PDF Export Feature for Lesson Plan Generator

## ฟีเจอร์ Export PDF สำหรับแผนการสอน

### คุณสมบัติ (Features)

- ✅ **รองรับภาษาไทยและอังกฤษ** - Support for both Thai and English text
- ✅ **คุณภาพสูง** - High-quality PDF output with proper font rendering
- ✅ **หลายหน้า** - Automatic multi-page support for long content
- ✅ **การจัดการเลย์เอาต์** - Smart layout management with proper margins
- ✅ **ชื่อไฟล์อัตโนมัติ** - Automatic filename generation with date
- ✅ **สถานะการโหลด** - Loading state with disabled button during export
- ✅ **การจัดการข้อผิดพลาด** - Error handling with user-friendly messages

### วิธีใช้งาน (How to Use)

1. ไปที่หน้ารายละเอียดแผนการสอน (Go to lesson plan detail page)
2. คลิกปุ่ม **"📄 Export PDF (ไทย/Eng)"**
3. รอให้ระบบสร้าง PDF (Wait for PDF generation)
4. ไฟล์ PDF จะถูกดาวน์โหลดอัตโนมัติ (PDF file will be downloaded automatically)

### เทคโนโลยีที่ใช้ (Technologies Used)

- **jsPDF** - สำหรับสร้าง PDF
- **html2canvas** - สำหรับแปลง HTML เป็นภาพ
- **Google Fonts (Sarabun)** - สำหรับฟอนต์ภาษาไทย
- **TypeScript** - สำหรับความปลอดภัยของโค้ด

### การติดตั้ง Dependencies

```bash
npm install jspdf html2canvas @types/jspdf
```

### โครงสร้างไฟล์ (File Structure)

```
src/
├── app/plan/[id]/page.tsx    # หน้ารายละเอียดแผนการสอนพร้อม Export PDF
└── lib/pdf-export.ts         # Utility functions สำหรับ Export PDF
```

### ฟีเจอร์เด่น (Key Features)

#### 1. การรองรับฟอนต์ไทย (Thai Font Support)
```typescript
// โหลดฟอนต์ Sarabun สำหรับภาษาไทย
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
```

#### 2. การจัดการหลายหน้า (Multi-page Handling)
```typescript
// แบ่งเนื้อหายาวเป็นหลายหน้าอัตโนมัติ
if (scaledHeight <= availableHeight) {
  // Single page
} else {
  // Multiple pages with smart breaking
}
```

#### 3. การตั้งชื่อไฟล์อัตโนมัติ (Automatic Filename Generation)
```typescript
// สร้างชื่อไฟล์ที่มีความหมาย
const filename = generateLessonPlanFilename(plan.unit_name, plan.subject);
// Result: "lesson-plan-ชื่อหน่วย-วิชา-2024-08-17.pdf"
```

#### 4. การจัดการสถานะ UI (UI State Management)
```typescript
// แสดงสถานะกำลังโหลด
button.textContent = '🔄 กำลัง Export...';
button.disabled = true;
```

### การปรับแต่ง (Customization)

#### เปลี่ยนคุณภาพ PDF (Change PDF Quality)
```typescript
await exportElementToPDF({
  elementId: 'lesson-plan-content',
  filename,
  scale: 2.0,      // ความละเอียด (1.0-3.0)
  quality: 0.95    // คุณภาพภาพ (0.0-1.0)
});
```

#### เปลี่ยนขนาดกระดาษ (Change Paper Size)
```typescript
const pdf = new jsPDF({
  orientation: 'portrait', // หรือ 'landscape'
  unit: 'mm',
  format: 'a4'            // หรือ 'letter', 'a3'
});
```

### การแก้ไขปัญหา (Troubleshooting)

#### ปัญหาฟอนต์ไทยไม่แสดง
1. ตรวจสอบการโหลด Google Fonts
2. ใช้ fallback fonts: `'Sarabun', 'Noto Sans Thai', 'Arial', sans-serif`

#### ปัญหา PDF ใหญ่เกินไป
1. ลดค่า `scale` ใน exportElementToPDF
2. ลดค่า `quality` ของภาพ
3. ใช้ JPEG แทน PNG

#### ปัญหาเนื้อหาถูกตัด
1. ตรวจสอบ CSS overflow properties
2. ปรับ margins ใน PDF settings
3. ใช้ page-break CSS classes

### การพัฒนาต่อ (Future Enhancements)

- [ ] เพิ่มตัวเลือกขนาดกระดาษ
- [ ] เพิ่มธีมสีสำหรับ PDF
- [ ] เพิ่มลายน้ำ (watermark)
- [ ] เพิ่มการ export แบบ batch
- [ ] เพิ่มการบีบอัดไฟล์ PDF

### License

MIT License - ใช้งานได้อย่างอิสระ
