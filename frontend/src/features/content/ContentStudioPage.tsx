import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Image, Video, FileText, Sparkles, Upload, Plus, Search, Grid3X3, List, Heart, Download, Trash2, Bot } from 'lucide-react';
import { cn } from '@/utils/helpers';

export const ContentStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('images');
  const [aiPrompt, setAiPrompt] = useState('');

  const [generatedContent, setGeneratedContent] = useState<{headlines: string[]; descriptions: string[]; hashtags: string[]} | null>(null);

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    setGeneratedContent({
      headlines: [
        `🔥 ${aiPrompt} - عرض حصري لفترة محدودة!`,
        `لا تفوت فرصة ${aiPrompt} - احصل عليه اليوم`,
        `🌟 ${aiPrompt} بأفضل سعر في السوق`,
      ],
      descriptions: [
        `اكتشف ${aiPrompt} المذهل! جودة عالية وسعر لا يقبل المنافسة. اطلب الآن واستفد من التوصيل المجاني 🚀`,
        `هل تبحث عن ${aiPrompt}؟ نحن نوفر لك أفضل الخيارات بأعلى جودة. ضمان واسترجاع مجاني! ✨`,
      ],
      hashtags: [`#${aiPrompt.replace(/\s/g, '')}`, '#عرض_خاص', '#تخفيضات', '#تسوق_اونلاين', '#جودة_عالية', '#السعودية'],
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('content.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">إنشاء وإدارة المحتوى الإعلاني</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Upload className="w-4 h-4" />}>رفع</Button>
          <Button icon={<Sparkles className="w-4 h-4" />}>{t('content.aiGeneration')}</Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'images', label: t('content.imageLibrary') },
          { id: 'videos', label: t('content.videoLibrary') },
          { id: 'texts', label: t('content.adTexts') },
          { id: 'ai', label: t('content.aiGeneration') },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'images' && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Input placeholder="بحث في الصور..." icon={<Search className="w-4 h-4" />} className="max-w-xs" />
            <Button variant="outline" size="sm"><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm"><List className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={`https://via.placeholder.com/300x300?text=Image+${i}`} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-full"><Heart className="w-4 h-4 text-red-500" /></button>
                  <button className="p-2 bg-white rounded-full"><Download className="w-4 h-4" /></button>
                  <button className="p-2 bg-white rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            ))}
            <button className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary-500 transition-colors">
              <Plus className="w-8 h-8 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="text-center py-16">
          <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">مكتبة الفيديو</p>
          <Button variant="outline" className="mt-4" icon={<Upload className="w-4 h-4" />}>رفع فيديو</Button>
        </div>
      )}

      {activeTab === 'texts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge>نص إعلاني</Badge>
                <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-gray-900 dark:text-dark-text mb-2">عنوان الإعلان: عرض خاص بمناسبة الربيع 🌸</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">اكتشف مجموعتنا الجديدة من المنتجات بخصم يصل إلى 50%! لفترة محدودة...</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                <span className="text-xs text-gray-400">منذ 3 أيام</span>
                <div className="flex gap-1">
                  <Heart className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">12</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              {t('content.generateContent')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('content.productDescription')}</label>
                <textarea
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[120px] text-sm"
                  placeholder={t('content.writeDescription')}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerateAI} className="w-full" icon={<Bot className="w-4 h-4" />}>
                توليد محتوى بالذكاء الاصطناعي
              </Button>
            </div>
          </Card>

          {generatedContent && (
            <div className="space-y-4">
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-3">{t('content.generatedHeadlines')}</h4>
                <div className="space-y-2">
                  {generatedContent.headlines.map((h, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                      {h}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-3">{t('content.generatedDescriptions')}</h4>
                <div className="space-y-2">
                  {generatedContent.descriptions.map((d, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                      {d}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-3">{t('content.generatedHashtags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.map((tag, i) => (
                    <Badge key={i} variant="info">{tag}</Badge>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



