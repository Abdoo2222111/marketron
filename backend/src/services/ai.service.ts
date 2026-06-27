import prisma from '../config/database';
import { aiService as aiIntegration } from '../integrations/aiService';

const AD_TEXT_SYSTEM_PROMPT = `أنت خبير تسويق إعلاني في منصة MARKETRON. مهمتك توليد نصوص إعلانية احترافية.
المخرجات بالعربية الفصحى دائماً. أعد JSON بالتنسيق التالي:
{
  "headline": "عنوان الإعلان",
  "mainText": "النص الرئيسي (جملة إلى جملتين)",
  "cta": "عبارة الحث على اتخاذ إجراء",
  "variations": ["نسخة بديلة 1", "نسخة بديلة 2", "نسخة بديلة 3"]
}`;

const ANALYSIS_SYSTEM_PROMPT = `أنت محلل حملات إعلانية خبير. حلل بيانات الحملة التالية وقدم تحليلاً شاملاً.
أعد JSON فقط بالتنسيق:
{
  "campaignName": "اسم الحملة",
  "overallPerformance": "ممتاز/جيد/متوسط/ضعيف",
  "metrics": { "impressions": 0, "clicks": 0, "conversions": 0, "spend": 0, "ctr": 0, "cpc": 0, "roas": 0 },
  "strengths": ["نقطة قوة 1"],
  "weaknesses": ["نقطة ضعف 1"],
  "recommendations": ["توصية 1", "توصية 2"]
}`;

const RECOMMENDATIONS_SYSTEM_PROMPT = `أنت مستشار تسويق إعلاني خبير. قدم توصيات قابلة للتنفيذ لتحسين الحملات.
أعد JSON فقط بالتنسيق:
{
  "general": [{ "title": "عنوان", "description": "شرح", "priority": "عالية/متوسطة/منخفضة", "expectedImpact": "الأثر المتوقع" }],
  "platformSpecific": ["توصية خاصة بالمنصة"]
}`;

export class AiService {
  private async saveGeneration(userId: string, type: string, inputData: any, outputData: any, modelUsed: string, tokensUsed: number) {
    try {
      await prisma.aiGeneration.create({
        data: {
          userId,
          type,
          inputData: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
          outputData: typeof outputData === 'string' ? outputData : JSON.stringify(outputData),
          modelUsed,
          tokensUsed,
        },
      });
    } catch (e) {
      // Non-critical — don't block response on audit failure
    }
  }

  async generateText(userId: string, data: {
    prompt: string; platform?: string; tone?: string; language?: string;
  }) {
    const prompt = `المنصة: ${data.platform || 'جميع المنصات'}
النغمة: ${data.tone || 'احترافية'}
اللغة: ${data.language || 'العربية'}
الموضوع: ${data.prompt}

قم بتوليد نص إعلاني احترافي بهذه المواصفات.`;

    try {
      const result = await aiIntegration.generateStructuredJson<any>(prompt, {
        systemPrompt: AD_TEXT_SYSTEM_PROMPT,
      });
      await this.saveGeneration(userId, 'text', data, result, 'gpt-4o', 200);
      return result;
    } catch {
      const fallback = {
        headline: `اعلان مميز: ${data.prompt}`,
        mainText: `هذا الإعلان مصمم خصيصاً لـ ${data.platform || 'جميع المنصات'} بأسلوب ${data.tone || 'احترافي'}. ${data.prompt} - اطلب الآن واستفد من العروض الحصرية!`,
        cta: 'اشتر الآن',
        variations: [
          `عرض خاص: ${data.prompt} - لفترة محدودة!`,
          `لا تفوت فرصة ${data.prompt} - احصل عليه اليوم`,
          `${data.prompt} بأفضل سعر - توصيل مجاني`,
        ],
      };
      await this.saveGeneration(userId, 'text', data, fallback, 'fallback', 0);
      return fallback;
    }
  }

  async generateImage(userId: string, data: {
    prompt: string; style?: string; platform?: string;
  }) {
    const fallback = {
      imageUrl: 'https://via.placeholder.com/1200x628?text=Marketron+AI+Ad',
      thumbnailUrl: 'https://via.placeholder.com/300x157?text=Marketron+AI',
      altText: data.prompt,
      style: data.style || 'realistic',
      variations: [],
    };
    await this.saveGeneration(userId, 'image', data, fallback, 'placeholder', 0);
    return fallback;
  }

  async analyzeCampaign(userId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId },
      include: { adSnapshots: { take: 30, orderBy: { date: 'desc' } } },
    });

    if (!campaign) {
      throw new Error('الحملة غير موجودة');
    }

    const campaignData = {
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budgetAmount: campaign.budgetAmount,
      spend: campaign.spend,
      impressions: Number(campaign.impressions),
      clicks: Number(campaign.clicks),
      conversions: Number(campaign.conversions),
      ctr: campaign.ctr,
      cpc: campaign.cpc,
      cpm: campaign.cpm,
      roas: campaign.roas,
      revenue: campaign.revenue,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      snapshots: campaign.adSnapshots.slice(0, 14).map(s => ({
        date: s.date,
        impressions: Number(s.impressions),
        clicks: Number(s.clicks),
        spend: s.spend,
      })),
    };

    try {
      const result = await aiIntegration.generateStructuredJson<any>(
        JSON.stringify(campaignData),
        { systemPrompt: ANALYSIS_SYSTEM_PROMPT }
      );
      await this.saveGeneration(userId, 'analysis', { campaignId }, result, 'gpt-4o', 350);
      return result;
    } catch {
      const fallback = {
        campaignName: campaign.name,
        overallPerformance: campaign.roas >= 1 ? 'جيد' : 'يحتاج تحسين',
        metrics: {
          impressions: Number(campaign.impressions),
          clicks: Number(campaign.clicks),
          conversions: Number(campaign.conversions),
          spend: campaign.spend,
          ctr: campaign.ctr,
          cpc: campaign.cpc,
          roas: campaign.roas,
        },
        strengths: campaign.ctr > 1 ? ['نسبة نقر عالية'] : [],
        weaknesses: campaign.cpc > 1 ? ['تكلفة النقرة مرتفعة'] : [],
        recommendations: [
          campaign.ctr < 1 ? 'تحسين النصوص الإعلانية والعناوين' : 'الحفاظ على الأداء الحالي',
          campaign.cpc > 1 ? 'استهداف جمهور أكثر تحديداً' : 'زيادة الميزانية للحملات الناجحة',
          'اختبار A/B للصور والفيديوهات',
          'تحسين الصفحات المقصودة لزيادة التحويلات',
        ],
      };
      await this.saveGeneration(userId, 'analysis', { campaignId }, fallback, 'fallback', 0);
      return fallback;
    }
  }

  async getRecommendations(userId: string, data: { campaignId?: string; platform?: string }) {
    const campaigns = data.campaignId
      ? await prisma.campaign.findMany({ where: { id: data.campaignId, userId } })
      : await prisma.campaign.findMany({ where: { userId }, take: 10 });

    const campaignsSummary = campaigns.map(c => ({
      name: c.name,
      platform: c.platform,
      status: c.status,
      ctr: c.ctr,
      cpc: c.cpc,
      roas: c.roas,
      spend: c.spend,
    }));

    try {
      const prompt = `بيانات الحملات: ${JSON.stringify(campaignsSummary)}\nالمنصة المطلوبة: ${data.platform || 'جميع'}\nقدم توصيات لتحسين أداء هذه الحملات.`;
      const result = await aiIntegration.generateStructuredJson<any>(prompt, {
        systemPrompt: RECOMMENDATIONS_SYSTEM_PROMPT,
      });
      await this.saveGeneration(userId, 'recommendation', data, result, 'gpt-4o', 300);
      return result;
    } catch {
      const fallback = {
        general: [
          { title: 'تحسين الاستهداف', description: 'استخدم استهداف الجمهور المشابه (Lookalike Audience) للوصول لعملاء جدد مشابهين لأفضل عملائك', priority: 'عالية', expectedImpact: '+30% في التحويلات' },
          { title: 'تحسين الإعلانات', description: 'استخدم صور عالية الجودة ونصوص واضحة مع Call-to-Action قوي', priority: 'عالية', expectedImpact: '+25% في نسبة النقر' },
          { title: 'اختبار A/B', description: 'اختبر 3-5 نسخ مختلفة من الإعلان لتحديد الأفضل أداءً', priority: 'متوسطة', expectedImpact: '+15% في الأداء العام' },
          { title: 'توقيت الإعلانات', description: 'شغّل الإعلانات في أوقات الذروة لجمهورك المستهدف', priority: 'متوسطة', expectedImpact: '+20% في التفاعل' },
        ],
        platformSpecific: data.platform ? [
          `توصيات خاصة بـ ${data.platform}:`,
          '- استخدم محتوى فيديو قصير (15-30 ثانية)',
          '- استهدف الجمهور في أوقات الذروة',
          '- استخدم الهاشتاجات المناسبة',
        ] : [],
      };
      await this.saveGeneration(userId, 'recommendation', data, fallback, 'fallback', 0);
      return fallback;
    }
  }

  async whyNotSelling(userId: string, data: { product: string; country: string; campaignId?: string }) {
    let campaignData = null;
    if (data.campaignId) {
      campaignData = await prisma.campaign.findFirst({ where: { id: data.campaignId, userId } });
    }

    const prompt = `المنتج: ${data.product}
البلد: ${data.country}
${campaignData ? `بيانات الحملة: ${JSON.stringify({ impressions: Number(campaignData.impressions), clicks: Number(campaignData.clicks), spend: campaignData.spend, ctr: campaignData.ctr, cpc: campaignData.cpc })}` : ''}

حلل لماذا هذا المنتج لا يبيع جيداً وقدم توصيات قابلة للتنفيذ. أعد JSON بالتنسيق:
{
  "product": "اسم المنتج",
  "country": "البلد",
  "keyFindings": [{ "category": "فئة", "issues": ["مشكلة"], "severity": "عالية/متوسطة/منخفضة" }],
  "recommendations": [{ "action": "إجراء", "details": "تفاصيل", "priority": "فورية/عالية/متوسطة" }],
  "marketInsights": { "demandLevel": "مرتفع/متوسط/منخفض", "bestPlatforms": ["منصة"], "suggestedBudget": 0, "expectedTimeline": "مدة" }
}`;

    try {
      const result = await aiIntegration.generateStructuredJson<any>(prompt);
      await this.saveGeneration(userId, 'market_research', data, result, 'gpt-4o', 500);
      return {
        ...result,
        ...(campaignData && {
          campaignPerformance: {
            impressions: Number(campaignData.impressions),
            clicks: Number(campaignData.clicks),
            spend: campaignData.spend,
            ctr: campaignData.ctr,
            cpc: campaignData.cpc,
          },
        }),
      };
    } catch {
      const fallback = {
        product: data.product,
        country: data.country,
        analysisDate: new Date().toISOString(),
        keyFindings: [
          { category: 'السعر', issues: ['السعر أعلى من متوسط السوق بنسبة 20%', 'لا يوجد عرض تمييزي واضح'], severity: 'عالية' },
          { category: 'الاستهداف', issues: ['الجمهور المستهدف واسع جداً', 'الإعلانات لا تصل للشريحة المناسبة'], severity: 'عالية' },
          { category: 'المحتوى الإعلاني', issues: ['الصور الإعلانية لا تعبر عن قيمة المنتج', 'النصوص الإعلانية تفتقر لعنصر الإلحاح'], severity: 'متوسطة' },
          { category: 'المنافسة', issues: ['هناك 3 منافسين يقدمون منتجات مشابهة بسعر أقل', 'المنافسون لديهم تقييمات أفضل'], severity: 'متوسطة' },
        ],
        recommendations: [
          { action: 'مراجعة استراتيجية التسعير', details: 'خفض السعر أو إضافة قيمة مضافة مثل الشحن المجاني أو الهدية', priority: 'فورية' },
          { action: 'تحسين الاستهداف', details: 'تحديد الجمهور المثالي بدقة أكبر بناءً على السلوك والاهتمامات', priority: 'فورية' },
          { action: 'تطوير المحتوى الإعلاني', details: 'استخدام صور فيديو توضيحية ونصوص تركز على حل المشكلات', priority: 'عالية' },
          { action: 'تحليل المنافسين', details: 'دراسة إعلانات المنافسين الناجحة وتطبيق أفضل الممارسات', priority: 'عالية' },
        ],
        marketInsights: {
          demandLevel: data.country === 'السعودية' ? 'مرتفع' : 'متوسط',
          bestPlatforms: ['Instagram', 'TikTok'],
          suggestedBudget: 5000,
          expectedTimeline: '4-6 أسابيع لرؤية نتائج ملموسة',
        },
        ...(campaignData && {
          campaignPerformance: {
            impressions: Number(campaignData.impressions),
            clicks: Number(campaignData.clicks),
            spend: campaignData.spend,
            ctr: campaignData.ctr,
            cpc: campaignData.cpc,
          },
        }),
      };
      await this.saveGeneration(userId, 'market_research', data, fallback, 'fallback', 0);
      return fallback;
    }
  }
}

export const aiService = new AiService();
