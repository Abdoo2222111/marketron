// ============================================================
// تصدير CSV
// exportToCsv.ts
// ============================================================

import { saveAs } from 'file-saver';

interface CsvOptions {
  delimiter?: string;
  includeBom?: boolean;
  rtl?: boolean;
}

/**
 * تحويل مصفوفة بيانات إلى CSV
 * مع دعم الأسماء العربية والأرقام
 */
export function toCsv<T extends Record<string, any>>(
  data: T[],
  options: CsvOptions = {}
): string {
  const {
    delimiter = ',',
    includeBom = true,
    rtl = false,
  } = options;

  if (data.length === 0) return '';

  // استخراج الرؤوس
  const headers = Object.keys(data[0]);

  // بناء صفوف CSV
  const rows: string[] = [];

  // إضافة BOM للأحرف العربية (UTF-8)
  let csv = includeBom ? '\uFEFF' : '';

  // صف الرؤوس
  rows.push(headers.map(header => escapeCsvField(header, delimiter)).join(delimiter));

  // صفوف البيانات
  for (const item of data) {
    const row = headers.map(header => {
      const value = item[header];
      if (value == null) return '';
      if (typeof value === 'number') {
        // تنسيق الأرقام بدون فواصل عربية
        return String(value);
      }
      if (typeof value === 'object') {
        return escapeCsvField(JSON.stringify(value), delimiter);
      }
      return escapeCsvField(String(value), delimiter);
    });
    rows.push(row.join(delimiter));
  }

  csv += rows.join('\n');

  return csv;
}

/** تهريب الحقول الخاصة في CSV */
function escapeCsvField(value: string, delimiter: string): string {
  // إذا كان الحقل يحتوي على فاصلة أو علامة اقتباس أو سطر جديد
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    // استبدال علامات الاقتباس المزدوجة باثنتين
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** تصدير مصفوفة بيانات إلى ملف CSV */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string = 'report',
  options: CsvOptions = {}
): Blob {
  const csv = toCsv(data, options);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/** تصدير وتحميل مباشر */
export function downloadCsv<T extends Record<string, any>>(
  data: T[],
  filename: string = 'report',
  options: CsvOptions = {}
): void {
  const blob = exportToCsv(data, filename, options);
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  saveAs(blob, safeName);
}

/** تحويل عنصر HTML جدول إلى CSV */
export function tableToCsv(tableElement: HTMLTableElement): string {
  const rows = tableElement.querySelectorAll('tr');
  const csvRows: string[] = [];

  for (const row of rows) {
    const cells = row.querySelectorAll('td, th');
    const csvRow = Array.from(cells)
      .map(cell => {
        let text = cell.textContent?.trim() || '';
        // إزالة الأيقونات والرموز التعبيرية
        text = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
        text = text.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
        text = text.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
        text = text.replace(/[\u{2600}-\u{26FF}]/gu, '');
        return escapeCsvField(text.trim(), ',');
      })
      .join(',');

    csvRows.push(csvRow);
  }

  return '\uFEFF' + csvRows.join('\n');
}
