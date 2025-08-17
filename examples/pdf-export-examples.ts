// Example: How to use PDF Export feature in other components

import { exportElementToPDF, generateLessonPlanFilename } from '@/lib/pdf-export';

// Basic usage
const handleExportToPDF = async () => {
  try {
    await exportElementToPDF({
      elementId: 'content-to-export',
      filename: 'my-document.pdf'
    });
    alert('PDF exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
  }
};

// Advanced usage with custom options
const handleAdvancedExport = async () => {
  const filename = generateLessonPlanFilename(
    'Unit 1: Introduction to Science',
    'Physics'
  );
  
  await exportElementToPDF({
    elementId: 'lesson-plan-content',
    filename,
    scale: 2.0,    // Higher quality
    quality: 0.98  // Better image quality
  });
};

// Export with custom styling
const handleStyledExport = async () => {
  const element = document.getElementById('content');
  
  // Add export-specific styling
  element?.classList.add('pdf-export-mode');
  
  try {
    await exportElementToPDF({
      elementId: 'content',
      filename: 'styled-document.pdf'
    });
  } finally {
    // Remove styling after export
    element?.classList.remove('pdf-export-mode');
  }
};

export { handleExportToPDF, handleAdvancedExport, handleStyledExport };
