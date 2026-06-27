// @ts-nocheck
import prisma from '../config/database';
import { aiService as aiIntegration } from '../integrations/aiService';
import logger from '../utils/logger';

export class AiBrainService {

  async buildBusinessContext(orgId: string) {
    const [bp, pc] = await Promise.all([
      prisma.businessProfile.findUnique({ where: { orgId } }),
      prisma.personaConfig.findUnique({ where: { orgId } }),
    ]);
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');

    const mode = pc?.isActive ? 'client_persona' : 'acquire_for_marketron';
    const products = bp?.products ? this.safeParseJson(bp.products, []) : [];
    const faqs = bp?.faqData ? this.safeParseJson(bp.faqData, []) : [];

    let systemPrompt = '';
    if (org.mode === 'acquire_for_marketron') {
      systemPrompt = `أنت مندوب مبيعات Marketron AI Suite. منصة متكاملة لإدارة الحملات الإعلانية عبر وسائل التواصل الاجتماعي مع وكيل ذكي للرد على العملاء.

مهمتك: فهم احتياج العميل المحتمل، الرد بثقة واحترافية، وجمع المعلومات التالية:
1. اسم العميل
2. نوع نشاطه التجاري
3. احتياجه من المنصة
4. تحديد موعد مكالمة مع جيمي (صاحب المنصة) لو الاهتمام جدي

نغمة الرد: ودودة، مهنية، مختصرة. لا تذكر أسعاراً دقيقة — قل "بأسعار تبدأ من 99 دولار شهرياً".
إذا طلب العميل التحدث مع شخص حقيقي → حول فوراً.`;
    } else {
      const agentName = pc?.agentName || 'مندوب المبيعات';
      const industry = bp?.industry || 'التجارة الإلكترونية';
      const priceRange = bp?.pricingTier || 'متوسط';
      const tone = bp?.toneOfVoice || 'مهنية';
      const productsText = products.length > 0 ? products.join('، ') : 'منتجات وخدمات متنوعة';

      let faqsText = '';
      if (faqs.length > 0) {
        faqsText = faqs.map((f: any) => `س: ${f.q || f.question}\nج: ${f.a || f.answer}`).join('\n');
      }

      systemPrompt = `أنت ${agentName} في "${org.name}".

نشاطهم: ${industry}.
المنتجات/الخدمات: ${productsText}.
نطاق الأسعار: ${priceRange}.
نغمة الكلام المطلوبة: ${tone}.

${faqsText ? `الأسئلة الشائعة:\n${faqsText}\n` : ''}
قواعد مهمة:
- رد بنفس أسلوب ونغمة الشركة المحددة أعلاه
- إذا سأل عن سعر دقيق غير موجود → قل "سأحولك لأحد المختصين لتزويدك بعرض دقيق"
- إذا طلب التحدث مع شخص حقيقي → حول فوراً
- لا تخترع معلومات عن منتجات أو أسعار غير مؤكدة`;
    }

    return { systemPrompt, mode, businessProfile: bp, personaConfig: pc };
  }

  async generateSalesReply(conversationId: string, messageContent: string, orgId: string) {
    const context = await this.buildBusinessContext(orgId);
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const history = recentMessages.reverse().map(m => `${m.direction === 'inbound' ? 'عميل' : 'نظام'}: ${m.text}`).join('\n');

    const prompt = `المحادثة السابقة:
${history}

الرسالة الجديدة: ${messageContent}

رد بالعربية. ${context.mode === 'acquire_for_marketron' ? 'اجمع معلومات العميل بهدوء' : 'رد بأسلوب الشركة'}`;

    try {
      const result = await aiIntegration.generateText(prompt, { systemPrompt: context.systemPrompt });
      const confidence = 0.85;
      return { reply: result.text || result, confidence, mode: context.mode };
    } catch (err) {
      const fallbackReplies = [
        'شكراً لتواصلك! أحد المختصين سيعود إليك قريباً.',
        'تم استلام رسالتك. سنتواصل معك في أقرب وقت.',
      ];
      return { reply: fallbackReplies[0], confidence: 0.3, mode: context.mode, fallback: true };
    }
  }

  async generateCampaignDraft(orgId: string, brief: string) {
    const context = await this.buildBusinessContext(orgId);
    const products = context.businessProfile?.products
      ? this.safeParseJson(context.businessProfile.products, [])
      : [];

    const prompt = `بناءً على معلومات النشاط التالي، صمم حملة إعلانية كاملة:

اسم النشاط: ${(await prisma.organization.findUnique({ where: { id: orgId } }))?.name || 'نشاط تجاري'}
${products.length > 0 ? `المنتجات: ${products.join('، ')}` : ''}
${context.businessProfile?.industry ? `المجال: ${context.businessProfile.industry}` : ''}

ملخص الحملة المطلوب: ${brief}

أعد JSON فقط:
{
  "name": "اسم مقترح للحملة",
  "objective": "awareness | traffic | sales | leads | engagement",
  "platform": "facebook | instagram | tiktok | google",
  "targetAudience": { "country": "دولة", "ageMin": 18, "ageMax": 65, "gender": "all" },
  "budgetSuggested": 5000,
  "adTexts": [
    { "headline": "عنوان", "mainText": "نص رئيسي", "cta": "عبارة دعوة" }
  ],
  "adTextsCount": 3,
  "reasoning": "شرح مختصر لماذا هذا التصميم"
}`;

    try {
      const result = await aiIntegration.generateStructuredJson<any>(prompt);
      return result;
    } catch {
      return {
        name: `حملة: ${brief.substring(0, 30)}...`,
        objective: 'sales',
        platform: 'facebook',
        targetAudience: { country: 'السعودية', ageMin: 18, ageMax: 45, gender: 'all' },
        budgetSuggested: 3000,
        adTexts: [
          { headline: 'عرض خاص', mainText: brief, cta: 'تسوق الآن' },
          { headline: 'لا تفوت الفرصة', mainText: `عرض مميز: ${brief}`, cta: 'اطلب الآن' },
          { headline: 'خصم لفترة محدودة', mainText: `احصل على ${brief} بأفضل سعر`, cta: 'اشترك الآن' },
        ],
        adTextsCount: 3,
        reasoning: 'توصية تلقائية بناءً على المدخلات',
      };
    }
  }

  async analyzeCampaignPerformance(campaignData: any) {
    const prompt = `حلل أداء الحملة الإعلانية التالية وقدم نصائح للتحسين:
${JSON.stringify(campaignData, null, 2)}

أعد JSON فقط:
{
  "overallRating": "ممتاز | جيد | متوسط | ضعيف",
  "strengths": ["نقطة قوة"],
  "weaknesses": ["نقطة ضعف"],
  "recommendations": ["توصية"],
  "metrics": { "ctr": 0, "cpc": 0, "roas": 0 }
}`;
    try {
      return await aiIntegration.generateStructuredJson<any>(prompt);
    } catch {
      return {
        overallRating: 'جيد',
        strengths: ['نسبة نقر مناسبة', 'تكلفة معقولة'],
        weaknesses: ['يمكن تحسين الاستهداف'],
        recommendations: ['جرب اختبار A/B', 'حسّن الصور الإعلانية'],
        metrics: { ctr: campaignData.ctr || 0, cpc: campaignData.cpc || 0, roas: campaignData.roas || 0 },
      };
    }
  }

  async autoEnrichBusinessProfile(url: string) {
    const prompt = `قم بتحليل الرابط التالي واستخرج معلومات عن النشاط التجاري:
${url}

أعد JSON فقط:
{
  "industry": "المجال (مثل: تجارة إلكترونية، خدمات، تعليم)",
  "productsServices": ["منتج 1", "خدمة 1"],
  "priceRange": "منخفض | متوسط | مرتفع | فاخر",
  "toneOfVoice": "مهنية | ودودة | شبابية | رسمية",
  "targetAudience": { "country": "", "ageMin": 0, "ageMax": 0, "gender": "all" }
}`;
    try {
      return await aiIntegration.generateStructuredJson<any>(prompt);
    } catch {
      return null;
    }
  }

  async sandboxReply(orgId: string, message: string, history: { role: string; content: string }[] = []) {
    const context = await this.buildBusinessContext(orgId);
    const historyText = history.map(h => `${h.role === 'user' ? 'عميل' : 'نظام'}: ${h.content}`).join('\n');

    const prompt = `${historyText ? `المحادثة السابقة:\n${historyText}\n\n` : ''}الرسالة: ${message}\n\nرد:`;
    try {
      const result = await aiIntegration.generateText(prompt, { systemPrompt: context.systemPrompt });
      return { reply: result.text || result, mode: context.mode };
    } catch {
      return { reply: 'عذراً، واجهت مشكلة في توليد الرد. يرجى المحاولة مرة أخرى.', mode: context.mode };
    }
  }

  private safeParseJson(str: string | null | undefined, fallback: any = {}) {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
  }
}

export const aiBrainService = new AiBrainService();
