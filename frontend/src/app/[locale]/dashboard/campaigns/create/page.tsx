'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CampaignForm from '@/components/forms/CampaignForm';
import toast from 'react-hot-toast';
import { campaignsApi } from '@/services/api-modules';
import type { CreateCampaignData } from '@/types';

export default function CreateCampaignPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();

  const handleSubmit = async (data: CreateCampaignData) => {
    try {
      const res = await campaignsApi.create(data as any);
      if (res.data?.success) {
        toast.success('تم إنشاء الحملة بنجاح!');
        router.push(`/${locale}/dashboard/campaigns`);
      } else {
        toast.error(res.data?.error || 'فشل إنشاء الحملة');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'فشل الاتصال بالخادم');
    }
  };

  const handleAISuggestions = async (data: Partial<CreateCampaignData>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ prompt: `اقتراح حملة إعلانية: ${JSON.stringify(data)}`, systemPrompt: 'أنت خبير تسويق رقمي. قدم اقتراحات لحملة إعلانية.' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.data?.text || 'تم إنشاء الاقتراحات');
      }
    } catch {
      toast.error('فشل إنشاء الاقتراحات الذكية');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إنشاء حملة جديدة</h1>
            <p className="text-[#A1A1C2]">أنشئ حملة إعلانية احترافية خطوة بخطوة</p>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowRight size={16} />
            رجوع
          </Button>
        </div>

        {/* Campaign Form Wizard */}
        <CampaignForm
          onSubmit={handleSubmit}
          onAISuggestions={handleAISuggestions}
        />
    </div>
  );
}


