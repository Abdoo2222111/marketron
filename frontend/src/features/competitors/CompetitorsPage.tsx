import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export const CompetitorsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/competitors');
        const data = await res.json();
        setCompetitors(data?.data || []);
      } catch {
        setCompetitors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تحليل المنافسين</h1>
          <p className="text-gray-500 text-sm mt-1">تابع أداء منافسيك في السوق</p>
        </div>
        <Button><Plus className="w-4 h-4 ml-1" />إضافة منافس</Button>
      </div>

      {competitors.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا يوجد منافسون مضافون بعد</p>
          <p className="text-gray-400 text-sm mt-1">أضف منافساً لبدء التحليل</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((comp: any, i: number) => (
            <Card key={i} className="p-5">
              <h3 className="font-bold mb-1">{comp.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{comp.platform}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>الإعلانات النشطة</span><span className="font-semibold">{comp.activeAdsCount || 0}</span></div>
                <div className="flex justify-between"><span>الإنفاق التقديري</span><span className="font-semibold">{comp.estimatedSpend || 0}</span></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
