'use client';

import React, { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function PersonasTab() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { loadPersonas(); }, []);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const { personasApi } = await import('@/services/api-modules');
      const res = await personasApi.list();
      setPersonas(res.data?.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!editingSection) return;
    setSaving(true);
    try {
      const { personasApi } = await import('@/services/api-modules');
      await personasApi.update(editingSection, editPrompt);
      setFeedback('تم حفظ التخصيص بنجاح');
      setEditingSection(null);
      await loadPersonas();
    } catch { setFeedback('فشل حفظ التخصيص'); }
    finally { setSaving(false); }
  };

  const handleReset = async (section: string) => {
    try {
      const { personasApi } = await import('@/services/api-modules');
      await personasApi.reset(section);
      setFeedback('تم إعادة التعيين للإعدادات الافتراضية');
      await loadPersonas();
    } catch { setFeedback('فشل إعادة التعيين'); }
  };

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const categories = [...new Set(personas.map(p => p.category))];

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>;

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-sm text-emerald-400">{feedback}</p>
        </div>
      )}
      <p className="text-sm text-[#A1A1C2]">
        كل قسم وظيفي في المنصة له شخصية AI مخصصة. يمكنك تخصيص التعليمات (System Prompt) لكل شخصية بما يناسب نشاطك التجاري.
      </p>
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-xs font-bold text-[#A1A1C2] uppercase tracking-wider mb-2">{category}</h3>
          <div className="space-y-2">
            {personas.filter((p: any) => p.category === category).map((p: any) => {
              const isEditing = editingSection === p.section;
              return (
                <Card key={p.section} className="overflow-hidden border-[#2D2B55]/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 flex items-center justify-center text-lg flex-shrink-0">
                          {p.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm">{p.name}</h3>
                            {p.isCustomized && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                                مخصص
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => {
                          setEditingSection(p.section);
                          setEditPrompt(p.customPrompt || p.systemPrompt || '');
                        }}>
                          تخصيص
                        </Button>
                        {p.isCustomized && (
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-[#F59E0B]" onClick={() => handleReset(p.section)}>
                            إعادة افتراضي
                          </Button>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="mt-3 border-t border-[#2D2B55]/50 pt-3 space-y-2">
                        <Label className="text-xs flex items-center justify-between">
                          <span>التعليمات المخصصة</span>
                          <span className="text-[10px] text-[#A1A1C2]">{editPrompt.length} حرف</span>
                        </Label>
                        <textarea
                          value={editPrompt}
                          onChange={e => setEditPrompt(e.target.value)}
                          className="w-full text-xs rounded-lg border border-[#2D2B55] bg-[#1E1B3A]/50 p-2 min-h-[100px] text-white placeholder:text-[#6B6899] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] outline-none"
                          placeholder="اكتب التعليمات المخصصة لهذه الشخصية..."
                          dir="rtl"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="gradient-brand text-white border-0" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            حفظ
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSection(null)}>إلغاء</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 bg-[#1E1B3A]/50 rounded-lg p-2.5">
                        <p className="text-[11px] text-[#A1A1C2] leading-relaxed line-clamp-2">
                          {p.customPrompt || p.systemPrompt}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}