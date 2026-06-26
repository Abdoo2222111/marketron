'use client';

import React, { useState } from 'react';
import { Tag, Phone, Mail, MessageSquare, Clock, Sparkles, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/helpers';
import { CUSTOMER_STATUS_META, type Customer, type CustomerStatus } from '@/types/social';

interface CustomerPanelProps {
  customer: Customer | null;
  onStatusChange: (id: string, status: CustomerStatus) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export function CustomerPanel({ customer, onStatusChange, onSaveNotes }: CustomerPanelProps) {
  const [notesDraft, setNotesDraft] = useState('');
  const [editing, setEditing] = useState(false);

  React.useEffect(() => {
    setNotesDraft(customer?.notes || '');
    setEditing(false);
  }, [customer?.id]);

  if (!customer) {
    return (
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-800 mx-auto mb-3 flex items-center justify-center">
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">اختر محادثة لعرض بيانات العميل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col overflow-y-auto">
      {/* Avatar + Name */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 text-center">
        <div className={cn('w-16 h-16 rounded-full bg-gradient-to-br mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold', customer.avatarColor)}>
          {customer.initial}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">{customer.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{CUSTOMER_STATUS_META[customer.status].label}</p>
      </div>

      {/* Status chips */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-500 mb-2">تصنيف العميل</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CUSTOMER_STATUS_META) as CustomerStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(customer.id, s)}
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-full transition-all',
                customer.status === s
                  ? CUSTOMER_STATUS_META[s].color + ' font-medium ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900'
                  : 'bg-gray-50 text-gray-500 dark:bg-gray-800/50 hover:bg-gray-100'
              )}
            >
              {CUSTOMER_STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-500">معلومات التواصل</p>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a href={`tel:${customer.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-primary-600" dir="ltr">{customer.phone}</a>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 truncate">{customer.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">عبر: {customer.platform}</span>
        </div>
        {customer.source && (
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">مصدر: {customer.source}</span>
          </div>
        )}
        {customer.lastContactAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">آخر تواصل: {customer.lastContactAt}</span>
          </div>
        )}
      </div>

      {/* Value */}
      {customer.value ? (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 mb-1">القيمة المتوقعة</p>
          <p className="text-lg font-bold gradient-brand-text">{customer.value.toLocaleString('ar')} ريال</p>
        </div>
      ) : null}

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 mb-2">تصنيفات</p>
          <div className="flex flex-wrap gap-1">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">ملاحظات الفريق</p>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs text-primary-600 hover:text-primary-700">تعديل</button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              className="w-full min-h-[80px] p-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="اكتب ملاحظة..."
            />
            <div className="flex gap-2">
              <Button size="sm" className="gradient-brand text-white border-0 flex-1" onClick={() => { onSaveNotes(customer.id, notesDraft); setEditing(false); }}>
                <Save className="w-3.5 h-3.5 ml-1" />حفظ
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setNotesDraft(customer.notes || ''); setEditing(false); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            {customer.notes || 'لا توجد ملاحظات بعد.'}
          </p>
        )}
      </div>
    </div>
  );
}