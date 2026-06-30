'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Image, Video, FileText, Sparkles, Upload, Plus, Search,
  Grid3X3, List, Heart, Download, Trash2, Bot, Loader2,
  Copy, Check, AlertCircle, Wand2, ArrowLeft, ArrowRight,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { aiProvidersApi } from '@/services/api-modules';
import ModelSelector from '@/components/ai/ModelSelector';
import { generateClientText, generateClientImage } from '@/lib/client-ai';
import type {
  AiAdTextResult, AiImageResult,
  AiAnalysisResult, AiRecommendationResult, AiGenerationResult,
} from '@/services/api-modules';
import toast from 'react-hot-toast';

type TabId = 'text' | 'image' | 'video' | 'analyze' | 'recommend';

interface GeneratedText extends AiAdTextResult {}

export const ContentStudioPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('text');

  // ── Model Selection State ──
  const [textModel, setTextModel] = useState({ provider: '', model: '' });
  const [imageModel, setImageModel] = useState({ provider: '', model: '' });
  const [useCustomModel, setUseCustomModel] = useState(false);

  // ── Text Generation State ──
  const [textPrompt, setTextPrompt] = useState('');
  const [textPlatform, setTextPlatform] = useState('');
  const [textTone, setTextTone] = useState('professional');
  const [generatedText, setGeneratedText] = useState<GeneratedText | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Image Generation State ──
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [imagePlatform, setImagePlatform] = useState('');
  const [generatedImage, setGeneratedImage] = useState<AiImageResult | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // ── Analysis State ──
  const [campaignId, setCampaignId] = useState('');
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // ── Recommendations State ──
  const [recPlatform, setRecPlatform] = useState('');
  const [recommendations, setRecommendations] = useState<AiRecommendationResult | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  // ── Raw Generation State ──
  const [rawPrompt, setRawPrompt] = useState('');
  const [rawResult, setRawResult] = useState<AiGenerationResult | null>(null);
  const [rawLoading, setRawLoading] = useState(false);

  // ── Error ──
  const [error, setError] = useState<string | null>(null);

  const handleGenerateText = async () => {
    if (!textPrompt.trim()) return;
    setTextLoading(true);
    setError(null);
    try {
      if (useCustomModel && textModel.provider) {
        const result = await generateClientText({
          prompt: textPrompt,
          provider: textModel.provider,
          model: textModel.model || undefined,
          systemPrompt: `توليد نص إعلاني للمنصة: ${textPlatform || 'جميع المنصات'}، النغمة: ${textTone}`,
        });
        setGeneratedText({
          headline: result.text.substring(0, 60) || '',
          mainText: result.text || '',
          cta: 'اعرف المزيد',
          variations: [],
        });
      } else {
        const res = await aiProvidersApi.generateAdText({
          prompt: textPrompt,
          platform: textPlatform || undefined,
          tone: textTone,
        });
        setGeneratedText(res.data?.data || res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'فشل التوليد النصي';
      setError(msg);
      toast.error(msg);
    } finally {
      setTextLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setError(null);
    try {
      if (useCustomModel && imageModel.provider) {
        if (imageModel.provider === 'puter') {
          const result = await generateClientImage({
            prompt: imagePrompt,
            provider: imageModel.provider,
            model: imageModel.model || undefined,
          });
          setGeneratedImage({
            imageUrl: result.imageUrl,
            thumbnailUrl: result.imageUrl,
            altText: imagePrompt,
            style: imageStyle,
            variations: [],
          });
        } else {
          const res = await aiProvidersApi.generate({
            prompt: `توليد وصف صورة إعلانية: ${imagePrompt}`,
            provider: imageModel.provider,
            model: imageModel.model || undefined,
          });
          setGeneratedImage({
            imageUrl: '',
            thumbnailUrl: '',
            altText: imagePrompt,
            style: imageStyle,
            variations: [res.data?.data?.text || ''],
          });
        }
      } else {
        const res = await aiProvidersApi.generateImage({
          prompt: imagePrompt,
          style: imageStyle,
          platform: imagePlatform || undefined,
        });
        setGeneratedImage(res.data?.data || res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'فشل توليد الصورة';
      setError(msg);
      toast.error(msg);
    } finally {
      setImageLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!campaignId.trim()) return;
    setAnalysisLoading(true);
    setError(null);
    try {
      const res = await aiProvidersApi.analyzeCampaign(campaignId);
      setAnalysis(res.data?.data || res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'فشل التحليل';
      setError(msg);
      toast.error(msg);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRecommend = async () => {
    setRecLoading(true);
    setError(null);
    try {
      const res = await aiProvidersApi.getRecommendations({
        platform: recPlatform || undefined,
      });
      setRecommendations(res.data?.data || res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'فشل جلب التوصيات';
      setError(msg);
      toast.error(msg);
    } finally {
      setRecLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
      toast.success('تم النسخ');
    });
  };

  const renderTextTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="w-5 h-5 text-[#7C3AED]" />
            توليد نصوص إعلانية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>وصف المنتج أو الخدمة</Label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-xl border border-input bg-background text-sm resize-y"
              placeholder="اكتب وصفاً للمنتج أو الخدمة التي تريد الإعلان عنها..."
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">المنصة</Label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
                value={textPlatform}
                onChange={(e) => setTextPlatform(e.target.value)}
              >
                <option value="">كل المنصات</option>
                <option value="facebook">فيسبوك</option>
                <option value="instagram">انستجرام</option>
                <option value="tiktok">تيك توك</option>
                <option value="snapchat">سناب شات</option>
                <option value="twitter">تويتر</option>
                <option value="linkedin">لينكد إن</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">النغمة</Label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
                value={textTone}
                onChange={(e) => setTextTone(e.target.value)}
              >
                <option value="professional">احترافية</option>
                <option value="casual">ودية</option>
                <option value="urgent">عاجلة</option>
                <option value="luxury">فاخرة</option>
                <option value="humorous">فكاهية</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#1E1B3A]/50 rounded-lg">
            <input
              type="checkbox"
              id="use-custom-model-text"
              checked={useCustomModel}
              onChange={e => setUseCustomModel(e.target.checked)}
              className="rounded border-[#7C3AED]/30"
            />
            <label htmlFor="use-custom-model-text" className="text-xs text-[#A1A1C2] cursor-pointer">اختيار نموذج AI محدد</label>
          </div>
          {useCustomModel && (
            <ModelSelector
              value={textModel}
              onChange={setTextModel}
              label="نموذج الذكاء الاصطناعي"
              providerLabel="المزود"
              modelLabel="النموذج"
            />
          )}
          <Button
            onClick={handleGenerateText}
            disabled={textLoading || !textPrompt.trim()}
            className="w-full gradient-brand text-white border-0"
          >
            {textLoading ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-1" />
            )}
            توليد النص الإعلاني
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {error && activeTab === 'text' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {textLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto mb-2" />
                <p className="text-sm text-[#A1A1C2]">جارٍ التوليد...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {generatedText && !textLoading && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>العنوان</span>
                  <button
                    onClick={() => copyToClipboard(generatedText.headline, -1)}
                    className="p-1.5 hover:bg-[#1E1B3A] rounded-lg transition-colors"
                  >
                    {copiedIndex === -1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold gradient-brand-text">{generatedText.headline}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>النص الرئيسي</span>
                  <button
                    onClick={() => copyToClipboard(generatedText.mainText, -2)}
                    className="p-1.5 hover:bg-[#1E1B3A] rounded-lg transition-colors"
                  >
                    {copiedIndex === -2 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{generatedText.mainText}</p>
              </CardContent>
            </Card>

            {generatedText.cta && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">زر الدعوة للإجراء (CTA)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="default" className="text-sm px-4 py-1.5">{generatedText.cta}</Badge>
                </CardContent>
              </Card>
            )}

            {generatedText.variations && generatedText.variations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">نسخ بديلة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {generatedText.variations.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#1E1B3A]/50 rounded-xl text-sm flex items-start justify-between gap-2 group cursor-pointer hover:bg-[#1E1B3A] transition-colors"
                      onClick={() => copyToClipboard(v, i)}
                    >
                      <span>{v}</span>
                      {copiedIndex === i ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#A1A1C2] opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!generatedText && !textLoading && !error && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-[#A1A1C2]/30 mx-auto mb-3" />
              <p className="text-sm text-[#A1A1C2]">سيظهر النص المولد هنا</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderImageTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="w-5 h-5 text-[#7C3AED]" />
            توليد أوصاف صور إعلانية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>وصف الصورة المطلوبة</Label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background text-sm resize-y"
              placeholder="صف الصورة التي تريد إنشاءها..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">النمط</Label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
              >
                <option value="realistic">واقعي</option>
                <option value="minimalist">بسيط</option>
                <option value="luxury">فاخر</option>
                <option value="cartoon">كرتوني</option>
                <option value="vintage">كلاسيكي</option>
                <option value="modern">حديث</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">المنصة</Label>
              <select
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm"
                value={imagePlatform}
                onChange={(e) => setImagePlatform(e.target.value)}
              >
                <option value="">عام</option>
                <option value="facebook">فيسبوك</option>
                <option value="instagram">انستجرام</option>
                <option value="tiktok">تيك توك</option>
                <option value="snapchat">سناب شات</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#1E1B3A]/50 rounded-lg">
            <input
              type="checkbox"
              id="use-custom-model-image"
              checked={useCustomModel}
              onChange={e => setUseCustomModel(e.target.checked)}
              className="rounded border-[#7C3AED]/30"
            />
            <label htmlFor="use-custom-model-image" className="text-xs text-[#A1A1C2] cursor-pointer">اختيار نموذج AI محدد</label>
          </div>
          {useCustomModel && (
            <ModelSelector
              value={imageModel}
              onChange={setImageModel}
              label="نموذج الذكاء الاصطناعي"
              providerLabel="المزود"
              modelLabel="النموذج"
            />
          )}
          <Button
            onClick={handleGenerateImage}
            disabled={imageLoading || !imagePrompt.trim()}
            className="w-full gradient-brand text-white border-0"
          >
            {imageLoading ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-1" />
            )}
            توليد وصف الصورة
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {imageLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto mb-2" />
                <p className="text-sm text-[#A1A1C2]">جارٍ التوليد...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {generatedImage && !imageLoading && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>الصورة المولدة</span>
                  <Badge variant="outline">{generatedImage.style}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[1200/628] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden">
                  {generatedImage.imageUrl && generatedImage.imageUrl !== 'https://via.placeholder.com/1200x628?text=Marketron+AI+Ad' ? (
                    <img src={generatedImage.imageUrl} alt={generatedImage.altText} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <Image className="w-12 h-12 text-[#A1A1C2]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#A1A1C2]">{generatedImage.altText}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {generatedImage.variations.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">نسخ بديلة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {generatedImage.variations.map((v, i) => (
                    <div key={i} className="p-3 bg-[#1E1B3A]/50 rounded-xl text-sm">{v}</div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!generatedImage && !imageLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Image className="w-12 h-12 text-[#A1A1C2]/30 mx-auto mb-3" />
              <p className="text-sm text-[#A1A1C2]">سيظهر وصف الصورة هنا</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderAnalyzeTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-[#7C3AED]" />
            تحليل الحملات بالذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>معرف الحملة</Label>
            <Input
              placeholder="أدخل معرف الحملة للتحليل..."
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              dir="rtl"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analysisLoading || !campaignId.trim()}
            className="w-full gradient-brand text-white border-0"
          >
            {analysisLoading ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Bot className="w-4 h-4 ml-1" />
            )}
            تحليل الحملة
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {analysisLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
            </CardContent>
          </Card>
        )}

        {analysis && !analysisLoading && (
          <>
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{analysis.campaignName}</h3>
                  <Badge className={
                    analysis.overallPerformance === 'ممتاز' ? 'bg-green-500' :
                    analysis.overallPerformance === 'جيد' ? 'bg-blue-500' :
                    analysis.overallPerformance === 'متوسط' ? 'bg-amber-500' : 'bg-red-500'
                  }>
                    {analysis.overallPerformance}
                  </Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.impressions.toLocaleString()}</p>
                    <p className="text-xs text-[#A1A1C2]">مرات الظهور</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.clicks.toLocaleString()}</p>
                    <p className="text-xs text-[#A1A1C2]">النقرات</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.conversions.toLocaleString()}</p>
                    <p className="text-xs text-[#A1A1C2]">التحويلات</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.ctr.toFixed(2)}%</p>
                    <p className="text-xs text-[#A1A1C2]">نسبة النقر</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.cpc.toFixed(2)}</p>
                    <p className="text-xs text-[#A1A1C2]">تكلفة النقرة</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{analysis.metrics.roas.toFixed(2)}x</p>
                    <p className="text-xs text-[#A1A1C2]">ROAS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysis.strengths.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-600">نقاط القوة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500" /> {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.weaknesses.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-red-600">نقاط الضعف</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" /> {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">التوصيات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="text-sm p-2.5 bg-[#1E1B3A]/50 rounded-lg">{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {!analysis && !analysisLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-[#A1A1C2]/30 mx-auto mb-3" />
              <p className="text-sm text-[#A1A1C2]">سيظهر تحليل الحملة هنا</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderRecommendTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="w-5 h-5 text-[#7C3AED]" />
            توصيات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>المنصة (اختياري)</Label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              value={recPlatform}
              onChange={(e) => setRecPlatform(e.target.value)}
            >
              <option value="">جميع المنصات</option>
              <option value="facebook">فيسبوك</option>
              <option value="instagram">انستجرام</option>
              <option value="tiktok">تيك توك</option>
              <option value="snapchat">سناب شات</option>
              <option value="google">جوجل</option>
            </select>
          </div>
          <Button
            onClick={handleRecommend}
            disabled={recLoading}
            className="w-full gradient-brand text-white border-0"
          >
            {recLoading ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 ml-1" />
            )}
            جلب التوصيات
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {recLoading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
            </CardContent>
          </Card>
        )}

        {recommendations && !recLoading && (
          <>
            {recommendations.general.map((rec, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{rec.title}</h3>
                    <Badge className={
                      rec.priority === 'عالية' ? 'bg-red-500' :
                      rec.priority === 'متوسطة' ? 'bg-amber-500' : 'bg-blue-500'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#A1A1C2] mb-2">{rec.description}</p>
                  <div className="flex items-center gap-1 text-xs text-[#7C3AED]">
                    <ArrowLeft className="w-3 h-3" />
                    <span>الأثر المتوقع: {rec.expectedImpact}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {recommendations.platformSpecific.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">توصيات خاصة بالمنصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {recommendations.platformSpecific.map((s, i) => (
                      <li key={i} className="text-sm p-1.5 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!recommendations && !recLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Wand2 className="w-12 h-12 text-[#A1A1C2]/30 mx-auto mb-3" />
              <p className="text-sm text-[#A1A1C2]">ستظهر التوصيات هنا</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'text', label: 'نصوص إعلانية' },
    { id: 'image', label: 'صور إعلانية' },
    { id: 'analyze', label: 'تحليل الحملات' },
    { id: 'recommend', label: 'توصيات' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black gradient-brand-text">استوديو المحتوى الذكي</h1>
        <p className="text-[#A1A1C2] text-sm mt-1">
          أنشئ نصوصاً وصوراً إعلانية بمساعدة الذكاء الاصطناعي
        </p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      {activeTab === 'text' && renderTextTab()}
      {activeTab === 'image' && renderImageTab()}
      {activeTab === 'analyze' && renderAnalyzeTab()}
      {activeTab === 'recommend' && renderRecommendTab()}
    </div>
  );
};


