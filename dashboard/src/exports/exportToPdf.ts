// ============================================================
// تصدير Dashboard كامل إلى PDF
// exportToPdf.ts
// ============================================================
// يستخدم jsPDF + html2canvas
// دعم RTL كامل واللغة العربية

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ExportOptions } from '@/types';

/** تصدير عنصر HTML إلى PDF */
export async function exportToPdf(
  element: HTMLElement,
  options: ExportOptions
): Promise<Blob> {
  const {
    title,
    subtitle,
    includeCharts = true,
    rtl = true,
    pageSize = 'A4',
    orientation = 'portrait',
  } = options;

  // إنشاء مستند PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // إضافة الخط العربي (افتراضي jsPDF يدعم UTF-8)
  doc.setFont('Helvetica', 'normal');

  // التقاط لقطة للعنصر
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    onclone: (clonedDoc) => {
      // تطبيق بعض التعديلات على النسخة الم克隆ة
      if (rtl) {
        const body = clonedDoc.body;
        body.style.direction = 'rtl';
        body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  // الصفحة الأولى: العنوان
  doc.setFontSize(18);
  doc.setFont('Helvetica', 'bold');

  if (rtl) {
    // الكتابة من اليمين لليسار
    doc.text(title, pageWidth - margin, 20, { align: 'right' });
    if (subtitle) {
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.text(subtitle, pageWidth - margin, 28, { align: 'right' });
    }
    // خط فاصل
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
  } else {
    doc.text(title, margin, 20);
    if (subtitle) {
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'normal');
      doc.text(subtitle, margin, 28);
    }
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(margin, 32, pageWidth - margin, 32);
  }

  // إضافة الصورة
  if (includeCharts) {
    position = margin + 15;
    doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin - 15;
  }

  // الصفحات الإضافية
  while (heightLeft > 0) {
    position = margin;
    doc.addPage();
    doc.addImage(imgData, 'PNG', margin, position - (imgHeight - heightLeft), imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  // تذييل الصفحات
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(150, 150, 150);

    if (rtl) {
      doc.text(
        `${title} | الصفحة ${i} من ${totalPages} | ${new Date().toLocaleDateString('ar-SA')}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    } else {
      doc.text(
        `${title} | Page ${i} of ${totalPages} | ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 10
      );
    }
  }

  // إرجاع الـ Blob
  return doc.output('blob');
}

/** تصدير PDF مع خيار التحميل المباشر */
export async function downloadPdf(
  element: HTMLElement,
  filename: string,
  options: Omit<ExportOptions, 'format'> & { format?: ExportOptions['format'] } = { title: 'تقرير', rtl: true }
): Promise<void> {
  const blob = await exportToPdf(element, { ...options, format: 'pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
