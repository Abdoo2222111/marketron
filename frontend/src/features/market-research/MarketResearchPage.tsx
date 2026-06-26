import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, DollarSign, Target, Lightbulb, AlertTriangle, BarChart3, Download } from 'lucide-react';
import { cn, formatCurrency } from '@/utils/helpers';

export const MarketResearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchProduct, setSearchProduct] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (searchProduct.trim()) setShowResults(true);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t('marketResearch.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">تحليل الأسواق واكتشاف الفرص</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-3">
          <Input
            placeholder={t('marketResearch.enterProductName')}
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
            icon={<Search className="w-4 h-4" />}
          />
          <Button onClick={handleSearch} icon={<Search className="w-4 h-4" />}>بحث</Button>
        </div>
      </Card>

      {showResults && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'حجم السوق', value: '$2.4M', change: 'إجمالي السوق القابل للتوجيه', icon: BarChart3, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
              { label: 'السعر المتوسط', value: '$45 - $120', change: 'النطاق السعري', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
              { label: 'معدل النمو', value: '12.5%', change: 'سنوياً', icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
              { label: 'المنافسون', value: '23', change: 'منافس رئيسي', icon: Target, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('p-2 rounded-lg', stat.color)}><Icon className="w-5 h-5" /></div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-r-4 border-r-green-500">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900 dark:text-dark-text">{t('marketResearch.strengths')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">جودة عالية للمنتج</li>
                <li className="flex items-center gap-2">علامة تجارية قوية</li>
                <li className="flex items-center gap-2">فريق تسويق محترف</li>
              </ul>
            </Card>
            <Card className="p-5 border-r-4 border-r-red-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900 dark:text-dark-text">{t('marketResearch.weaknesses')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">سعر مرتفع نسبيا</li>
                <li className="flex items-center gap-2">تغطية جغرافية محدودة</li>
                <li className="flex items-center gap-2">قلة المحتوى المرئي</li>
              </ul>
            </Card>
            <Card className="p-5 border-r-4 border-r-blue-500">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-dark-text">{t('marketResearch.opportunities')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">نمو التجارة الإلكترونية</li>
                <li className="flex items-center gap-2">دخول أسواق جديدة</li>
                <li className="flex items-center gap-2">شراكات استراتيجية</li>
              </ul>
            </Card>
            <Card className="p-5 border-r-4 border-r-yellow-500">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-yellow-600" />
                <h3 className="font-bold text-gray-900 dark:text-dark-text">{t('marketResearch.threats')}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">منافسة شديدة من شركات كبرى</li>
                <li className="flex items-center gap-2">تغيرات في تشريعات الإعلان</li>
                <li className="flex items-center gap-2">تقلبات أسعار المواد الخام</li>
              </ul>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-dark-text mb-4">{t('marketResearch.entryRecommendations')}</h3>
            <div className="space-y-3">
              {[
                { priority: 'عالية', action: 'التركيز على التسويق عبر TikTok للوصول للفئة العمرية 18-34', impact: '+40% وصول' },
                { priority: 'عالية', action: 'تطوير محتوى فيديو قصير وجذاب', impact: '+35% تفاعل' },
                { priority: 'متوسطة', action: 'إطلاق حملات مؤثرة مع صناع المحتوى', impact: '+25% مبيعات' },
                { priority: 'متوسطة', action: 'تحسين الصفحات المقصودة للتجربة', impact: '+20% تحويل' },
              ].map((rec, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start gap-3">
                    <Badge variant={rec.priority === 'عالية' ? 'error' : 'warning'}>{rec.priority}</Badge>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec.action}</p>
                  </div>
                  <span className="text-xs font-medium text-green-600 flex-shrink-0">{rec.impact}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" icon={<Download className="w-4 h-4" />}>تصدير التقرير</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};


