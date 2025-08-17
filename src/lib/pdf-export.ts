import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  elementId: string;
  filename?: string;
  scale?: number;
  quality?: number;
}

export const exportElementToPDF = async (options: ExportOptions): Promise<void> => {
  const {
    elementId,
    filename = 'document.pdf',
    scale = 1.5,
    quality = 0.95
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  // Hide no-print elements
  const printElements = document.querySelectorAll('.no-print');
  printElements.forEach(el => (el as HTMLElement).style.display = 'none');

  // Add PDF export class for styling
  element.classList.add('pdf-export-mode');

  try {
    // Configure html2canvas for Thai/English text rendering
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Load Thai fonts in cloned document
        const style = clonedDoc.createElement('style');
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
          * {
            font-family: 'Sarabun', 'Noto Sans Thai', 'Arial', sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate scaling with margins
    const margin = 10;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    const widthRatio = availableWidth / imgWidth;
    const heightRatio = availableHeight / imgHeight;
    const ratio = Math.min(widthRatio, heightRatio);
    
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    const x = (pdfWidth - scaledWidth) / 2;
    const y = margin;

    // Handle multiple pages if content is too long
    if (scaledHeight <= availableHeight) {
      // Single page
      pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
    } else {
      // Multiple pages
      let remainingHeight = scaledHeight;
      let currentY = 0;
      let pageCount = 1;

      while (remainingHeight > 0) {
        const pageHeight = Math.min(remainingHeight, availableHeight);
        
        // Create canvas section for this page
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d')!;
        
        pageCanvas.width = canvas.width;
        pageCanvas.height = (pageHeight / ratio);
        
        pageCtx.drawImage(
          canvas,
          0, currentY / ratio,
          canvas.width, pageHeight / ratio,
          0, 0,
          canvas.width, pageHeight / ratio
        );
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
        
        if (pageCount > 1) {
          pdf.addPage();
        }
        
        pdf.addImage(pageImgData, 'JPEG', x, y, scaledWidth, pageHeight);
        
        currentY += pageHeight;
        remainingHeight -= pageHeight;
        pageCount++;
      }
    }

    // Save PDF
    pdf.save(filename);
    
  } finally {
    // Cleanup
    element.classList.remove('pdf-export-mode');
    printElements.forEach(el => (el as HTMLElement).style.display = '');
  }
};

export const generateLessonPlanFilename = (unitName: string, subject?: string): string => {
  const cleanUnitName = unitName.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  const subjectPart = subject ? `-${subject.replace(/[/\\?%*:|"<>]/g, '-')}` : '';
  
  return `lesson-plan-${cleanUnitName}${subjectPart}-${timestamp}.pdf`;
};
