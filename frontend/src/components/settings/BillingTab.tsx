'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CreditCard, History, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function BillingTab() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const api = (await import('@/services/api')).default;
      const res = await api.get('/auth/credits/balance');
      setBalance(res.data?.data?.balance || 0);
    } catch {
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-electric" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#7C3AED]/5 via-transparent to-[#06B6D4]/5 border-[#2D2B55]/50">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-[#7C3AED]" />
          </div>
          <p className="text-sm text-[#A1A1C2] mb-2">رصيدك الحالي</p>
          <p className="text-5xl font-black gradient-brand-text mb-4">{balance ?? 0}</p>
          <p className="text-xs text-[#A1A1C2]">توكن (1 توكن = 1 عملية ذكاء اصطناعي)</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">شحن الرصيد</h3>
                <p className="text-xs text-[#A1A1C2]">أضف رصيداً لاستخدام خدمات AI</p>
              </div>
            </div>
            <Button className="w-full gradient-brand text-white border-0" disabled>
              قريباً
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#14102B]/80 backdrop-blur-sm border border-[#2D2B55]/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">سجل العمليات</h3>
                <p className="text-xs text-[#A1A1C2]">تفاصيل استهلاك الرصيد</p>
              </div>
            </div>
            <Button className="w-full" variant="outline" disabled>
              قريباً
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#2D2B55]/30 border border-[#2D2B55]/50 rounded-xl p-5">
        <h3 className="font-bold text-sm mb-2">حالة الرصيد</h3>
        <p className="text-xs text-[#A1A1C2] leading-relaxed">
          التوكن هو وحدة حسابية تستخدم لجميع عمليات الذكاء الاصطناعي في المنصة.
          كل عملية (توليد نص، تحليل، محادثة مع وكيل) تستهلك توكن واحد. نظام الشراء قيد التطوير وسيتاح قريباً.
        </p>
      </div>
    </div>
  );
}