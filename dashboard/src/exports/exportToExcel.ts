// ============================================================
// تصدير أي جدول إلى Excel
// exportToExcel.ts
// ============================================================
// يستخدم SheetJS (xlsx) library
// دعم اللغة العربية وتنسيق متقدم

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { MetricKey } from '@/types';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'string' | 'number' | 'currency' | 'percentage' | 'date';
}

export interface ExcelOptions {
  sheetName?: string;
  columns?: ExcelColumn[];
  rtl?: boolean;
  filename?: string;
}

/**
 * تصدير مصفوفة بيانات إلى ملف Excel
 * @param data - مصفوفة الكائنات
 * @param options - خيارات التصدير
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExcelOptions = {}
): Blob {
  const {
    sheetName = 'تقرير',
    columns,
    rtl = true,
    filename = 'report',
  } = options;

  // إنشاء كتاب عمل
  const wb = XLSX.utils.book_new();

  // تحويل البيانات
  let wsData: any[][];
  let headers: string[];

  if (columns) {
    headers = columns.map(c => c.header);
    wsData = data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        if (col.type === 'currency' && typeof value === 'number') {
          return value;
        }
        if (col.type === 'percentage' && typeof value === 'number') {
          return value;
        }
        return value ?? '';
      })
    );
  } else {
    headers = Object.keys(data[0] || {});
    wsData = data.map(row => headers.map(h => row[h] ?? ''));
  }

  // إضافة رؤوس الأعمدة
  const ws = XLSX.utils.aoa_to_sheet([headers, ...wsData]);

  // تعيين عرض الأعمدة
  if (columns) {
    ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
  } else {
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
  }

  // تطبيق التنسيقات
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  // تنسيق الرأس
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: 'FFFFFF' },
        size: 11,
        name: 'Arial',
      },
      fill: {
        fgColor: { rgb: '6366F1' },
        patternType: 'solid',
      },
      alignment: {
        horizontal: rtl ? 'right' : 'left',
        vertical: 'center',
      },
      border: {
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      },
    };
  }

  // تنسيق الخلايا
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) continue;
      const cell = ws[cellAddress];
      const value = cell.v;

      if (!cell.s) cell.s = {};

      // تنسيق الأرقام
      if (typeof value === 'number') {
        const colDef = columns?.[col];
        if (colDef?.type === 'currency') {
          cell.s.numFmt = '#,##0.00 ر.س';
          cell.s.alignment = { horizontal: 'left' };
        } else if (colDef?.type === 'percentage') {
          cell.s.numFmt = '0.00%';
          cell.s.alignment = { horizontal: 'left' };
        } else {
          cell.s.numFmt = '#,##0';
          cell.s.alignment = { horizontal: 'left' };
        }
      } else {
        cell.s.alignment = {
          horizontal: rtl ? 'right' : 'left',
        };
      }

      // لون النص
      cell.s.font = {
        color: { rgb: '1E293B' },
        size: 10,
        name: 'Arial',
      };

      // تنسيق الصفوف المزدوجة
      if (row % 2 === 0) {
        cell.s.fill = {
          fgColor: { rgb: 'F8FAFC' },
          patternType: 'solid',
        };
      }
    }
  }

  // إضافة الورقة إلى الكتاب
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // توليد الملف وإرجاعه كـ Blob
  const wbOut = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    bookSST: false,
  });

  return new Blob([wbOut], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** تصدير وتحميل مباشر */
export function downloadExcel<T extends Record<string, any>>(
  data: T[],
  filename: string = 'report',
  options?: ExcelOptions
): void {
  const blob = exportToExcel(data, { ...options, filename });
  const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  saveAs(blob, safeName);
}

/** تصدير بيانات الأداء إلى Excel */
export function exportPerformanceToExcel(
  data: Array<Record<string, any>>,
  title: string = 'تقرير الأداء'
): void {
  const columns: ExcelColumn[] = [
    { header: 'التاريخ', key: 'date', width: 14, type: 'date' },
    { header: 'المنصة', key: 'platformAr', width: 12 },
    { header: 'الإنفاق', key: 'spend', width: 14, type: 'currency' },
    { header: 'مرات الظهور', key: 'impressions', width: 14 },
    { header: 'النقرات', key: 'clicks', width: 12 },
    { header: 'CTR', key: 'ctr', width: 10, type: 'percentage' },
    { header: 'تكلفة النقرة', key: 'cpc', width: 14, type: 'currency' },
    { header: 'التحويلات', key: 'conversions', width: 12 },
    { header: 'تكلفة التحويل', key: 'cpa', width: 14, type: 'currency' },
    { header: 'العائد', key: 'revenue', width: 14, type: 'currency' },
    { header: 'ROAS', key: 'roas', width: 10 },
  ];

  downloadExcel(data, title, {
    sheetName: title,
    columns,
    rtl: true,
  });
}
