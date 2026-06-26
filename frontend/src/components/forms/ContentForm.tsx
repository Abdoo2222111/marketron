'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Save, Calendar, Send, Sparkles, X, Image, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, generateId } from '@/lib/utils';
import type { Content, ContentType, ContentTone, ContentLength, PlatformType } from '@/types';

// Use a simple textarea as rich text editor to avoid react-quill SSR issues
const RichTextEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <textarea
    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    placeholder="اكتب المحتوى هنا..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    dir="rtl"
  />
);

interface ContentFormProps {
  onSubmit: (content: Partial<Content>) => void;
  onGenerateAI?: (params: {
    type: ContentType;
    platform: PlatformType;
    keywords: string;
    tone: ContentTone;
    length: ContentLength;
  }) => void;
}

export default function ContentForm({ onSubmit, onGenerateAI }: ContentFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<ContentType>('post');
  const [platform, setPlatform] = useState<PlatformType>('facebook');
  const [scheduledFor, setScheduledFor] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [showAIDialog, setShowAIDialog] = useState(false);

  // AI Generator state
  const [aiType, setAiType] = useState<ContentType>('post');
  const [aiPlatform, setAiPlatform] = useState<PlatformType>('facebook');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTone, setAiTone] = useState<ContentTone>('formal');
  const [aiLength, setAiLength] = useState<ContentLength>('medium');

  const handleSubmit = () => {
    const content: Partial<Content> = {
      title,
      body,
      type,
      platform,
      media,
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor || undefined,
    };
    onSubmit(content);
    // Reset form
    setTitle('');
    setBody('');
    setType('post');
    setScheduledFor('');
    setMedia([]);
  };

  const handleAIGenerate = () => {
    onGenerateAI?.({
      type: aiType,
      platform: aiPlatform,
      keywords: aiKeywords,
      tone: aiTone,
      length: aiLength,
    });
    setShowAIDialog(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">محتوى جديد</h2>
          <p className="text-muted-foreground">أنشئ محتوى ماركترون جديد</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIDialog(true)}>
            <Sparkles size={16} />
            توليد بالذكاء الاصطناعي
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label>عنوان المحتوى</Label>
            <Input
              placeholder="أدخل عنوان المحتوى..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نوع المحتوى</Label>
              <Select value={type} onValueChange={(v: ContentType) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">منشور</SelectItem>
                  <SelectItem value="article">مقال</SelectItem>
                  <SelectItem value="ad">إعلان</SelectItem>
                  <SelectItem value="description">وصف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المنصة</Label>
              <Select value={platform} onValueChange={(v: PlatformType) => setPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">فيسبوك</SelectItem>
                  <SelectItem value="instagram">انستجرام</SelectItem>
                  <SelectItem value="tiktok">تيك توك</SelectItem>
                  <SelectItem value="snapchat">سناب شات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>المحتوى</Label>
            <RichTextEditor value={body} onChange={setBody} />
          </div>

          <div className="space-y-2">
            <Label>الوسائط</Label>
            <div className="flex flex-wrap gap-3">
              {media.map((m, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                  <img src={m} alt="" className="h-full w-full object-cover rounded-lg" />
                  <button
                    onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -end-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors"
                onClick={() => {
                  const url = prompt('أدخل رابط الصورة:');
                  if (url) setMedia([...media, url]);
                }}
              >
                <Plus size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">خيارات النشر</h3>
              <div className="space-y-2">
                <Label>تاريخ ووقت النشر</Label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSubmit}>
                  <Save size={16} />
                  {scheduledFor ? 'جدولة' : 'حفظ'}
                </Button>
                <Button variant="premium" className="flex-1" onClick={handleSubmit}>
                  <Send size={16} />
                  نشر
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Preview */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">معاينة المنصة</h3>
              <Tabs defaultValue={platform}>
                <TabsList className="w-full">
                  <TabsTrigger value="facebook" className="flex-1 text-xs">فيسبوك</TabsTrigger>
                  <TabsTrigger value="instagram" className="flex-1 text-xs">انستجرام</TabsTrigger>
                  <TabsTrigger value="tiktok" className="flex-1 text-xs">تيك توك</TabsTrigger>
                </TabsList>
                <TabsContent value="facebook">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">F</div>
                      <div>
                        <p className="text-xs font-semibold">صفحتك</p>
                        <p className="text-[10px] text-muted-foreground">منذ دقيقة</p>
                      </div>
                    </div>
                    <p className="text-xs mb-2">{body.slice(0, 100) || 'نص الإعلان سيظهر هنا...'}</p>
                    {title && <p className="text-xs font-bold mb-1">{title}</p>}
                    <div className="h-32 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      {media.length > 0 ? <img src={media[0]} alt="" className="h-full w-full object-cover rounded" /> : 'مساحة الصورة'}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="instagram">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white text-xs">I</div>
                      <p className="text-xs font-semibold">صفحتك</p>
                    </div>
                    <div className="h-32 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground mb-2">
                      {media.length > 0 ? <img src={media[0]} alt="" className="h-full w-full object-cover rounded" /> : 'مساحة الصورة'}
                    </div>
                    <p className="text-xs">{body.slice(0, 80) || 'التعليق سيظهر هنا...'}</p>
                  </div>
                </TabsContent>
                <TabsContent value="tiktok">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white text-xs">T</div>
                      <p className="text-xs font-semibold">@صفحتك</p>
                    </div>
                    <div className="h-40 bg-gray-900 rounded flex items-center justify-center text-xs text-gray-400">
                      🎬 معاينة الفيديو
                    </div>
                    <p className="text-xs mt-2">{body.slice(0, 60) || 'وصف الفيديو...'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generator Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              توليد محتوى بالذكاء الاصطناعي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع المحتوى</Label>
                <Select value={aiType} onValueChange={(v: ContentType) => setAiType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">منشور</SelectItem>
                    <SelectItem value="article">مقال</SelectItem>
                    <SelectItem value="ad">إعلان</SelectItem>
                    <SelectItem value="description">وصف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المنصة</Label>
                <Select value={aiPlatform} onValueChange={(v: PlatformType) => setAiPlatform(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">فيسبوك</SelectItem>
                    <SelectItem value="instagram">انستجرام</SelectItem>
                    <SelectItem value="tiktok">تيك توك</SelectItem>
                    <SelectItem value="snapchat">سناب شات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>الكلمات المفتاحية</Label>
              <Input
                placeholder="أدخل الكلمات المفتاحية..."
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النبرة</Label>
                <Select value={aiTone} onValueChange={(v: ContentTone) => setAiTone(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">رسمي</SelectItem>
                    <SelectItem value="casual">عفوي</SelectItem>
                    <SelectItem value="enthusiastic">حماسي</SelectItem>
                    <SelectItem value="humorous">فكاهي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الطول</Label>
                <Select value={aiLength} onValueChange={(v: ContentLength) => setAiLength(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">قصير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="long">طويل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleAIGenerate}>
              <Sparkles size={16} />
              توليد المحتوى
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

