import prisma from '../config/database';
import logger from '../utils/logger';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysLater(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export class DemoDataService {
  async seedForUser(userId: string) {
    const existingCampaigns = await prisma.campaign.count({ where: { userId } });
    if (existingCampaigns > 0) {
      return { message: 'المستخدم لديه بيانات بالفعل', created: false };
    }

    const campaignTemplates = [
      { name: 'حملة إطلاق المنتج', platform: 'facebook', objective: 'awareness', status: 'active', budget: 5000 },
      { name: 'حملة مبيعات الموسم', platform: 'instagram', objective: 'sales', status: 'active', budget: 8000 },
      { name: 'حملة التفاعل', platform: 'facebook', objective: 'engagement', status: 'paused', budget: 3000 },
      { name: 'حملة جذب العملاء', platform: 'instagram', objective: 'leads', status: 'draft', budget: 4000 },
      { name: 'حملة العروض', platform: 'facebook', objective: 'traffic', status: 'active', budget: 2000 },
    ];

    await prisma.$transaction(async (tx) => {
      for (const p of [
        { platform: 'facebook', accountId: 'fb_page_' + userId.slice(0, 8), name: 'صفحة فيسبوك' },
        { platform: 'instagram', accountId: 'ig_account_' + userId.slice(0, 8), name: 'حساب انستجرام' },
      ]) {
        await tx.platformConnection.create({ data: { userId, platform: p.platform, accessToken: 'demo_' + userId, platformAccountId: p.accountId, platformAccountName: p.name, status: 'active' } });
      }

      for (const ct of campaignTemplates) {
        const c = await tx.campaign.create({
          data: {
            userId, name: ct.name, platform: ct.platform, objective: ct.objective,
            status: ct.status, budgetType: 'daily', budgetAmount: ct.budget,
            budgetCurrency: 'SAR', startDate: daysAgo(randomInt(10, 60)),
            endDate: daysLater(randomInt(10, 30)),
            impressions: BigInt(randomInt(10000, 200000)),
            clicks: BigInt(randomInt(500, 10000)),
            conversions: BigInt(randomInt(10, 500)),
            spend: randomFloat(500, 5000),
            ctr: randomFloat(1, 5), cpc: randomFloat(0.5, 3),
            cpm: randomFloat(5, 20), cpa: randomFloat(10, 100),
            revenue: randomFloat(1000, 50000), roas: randomFloat(1, 5),
            targetCountry: 'السعودية', targetAgeMin: 18, targetAgeMax: 45,
            targetGender: 'all', creativeHeadline: ct.name,
          },
        });

        for (const ad of [
          { name: `فيديو تعريفي - ${ct.name}`, headline: `اكتشف ${ct.name}`, text: 'جودة عالية وسعر مميز', cta: 'تسوق الآن' },
          { name: `صورة منتج - ${ct.name}`, headline: `عرض خاص ${ct.name}`, text: 'خصم يصل إلى 30%', cta: 'اعرف أكثر' },
        ]) {
          await tx.ad.create({
            data: {
              campaignId: c.id, platform: ct.platform, name: ad.name,
              status: ct.status === 'active' ? 'active' : 'paused',
              creativeHeadline: ad.headline, creativeText: ad.text, creativeCta: ad.cta,
              impressions: BigInt(randomInt(1000, 50000)),
              clicks: BigInt(randomInt(50, 3000)),
              conversions: BigInt(randomInt(1, 50)),
              spend: randomFloat(50, 1000),
              ctr: randomFloat(1, 8), cpc: randomFloat(0.3, 3),
              cpm: randomFloat(3, 15), cpa: randomFloat(5, 80),
            },
          });
        }

        for (let day = 0; day < 30; day++) {
          const imp = randomInt(100, 5000);
          const clk = randomInt(5, Math.floor(imp * 0.08));
          const conv = randomInt(0, 20);
          const spd = randomFloat(10, 300);
          const rev = conv * randomFloat(10, 100);
          await tx.adSnapshot.create({
            data: {
              campaignId: c.id, platform: ct.platform, date: daysAgo(day),
              impressions: BigInt(imp), clicks: BigInt(clk),
              conversions: BigInt(conv), spend: spd, revenue: rev,
              ctr: imp > 0 ? clk / imp : 0,
              cpc: clk > 0 ? spd / clk : 0,
              cpm: imp > 0 ? (spd / imp) * 1000 : 0,
              cpa: conv > 0 ? spd / conv : 0,
            },
          });
        }
      }

      await tx.userCredits.upsert({
        where: { userId },
        update: { balance: 500 },
        create: { userId, balance: 500, totalSpent: 0, totalPurchased: 500 },
      });
      await tx.creditTransaction.create({ data: { userId, amount: 500, type: 'purchase', description: 'باقة ترحيبية', balanceAfter: 500 } });

      for (const agent of [
        { name: 'مساعد المحتوى', type: 'content', prompt: 'أنت مساعد متخصص في إنشاء المحتوى التسويقي بالعربية.' },
        { name: 'محلل الحملات', type: 'analytics', prompt: 'أنت محلل حملات إعلانية متخصص.' },
        { name: 'مستشار استراتيجي', type: 'strategy', prompt: 'أنت مستشار تسويق استراتيجي.' },
        { name: 'خدمة العملاء', type: 'support', prompt: 'أنت مساعد خدمة عملاء متخصص بالرد على الاستفسارات.' },
      ]) {
        await tx.aiAgent.create({ data: { userId, name: agent.name, type: agent.type, systemPrompt: agent.prompt, isActive: true } });
      }

      for (const ct of [
        { type: 'image', title: 'منتجنا الجديد', description: 'اكتشف أحدث منتجاتنا', tags: ['منتج', 'جديد'] },
        { type: 'video', title: 'عرض الموسم', description: 'خصم حتى 30%', tags: ['عرض', 'تخفيضات'] },
        { type: 'image', title: 'نصائح تسويقية', description: 'أفضل نصائح التسويق', tags: ['نصائح', 'تسويق'] },
      ]) {
        await tx.content.create({ data: { userId, type: ct.type, title: ct.title, description: ct.description, fileUrl: '/uploads/demo_' + userId.slice(0, 8) + '.jpg', tags: JSON.stringify(ct.tags) } });
      }

      for (const comp of [
        { name: 'المنافس الأول', platform: 'facebook', username: 'comp1', spend: 15000 },
        { name: 'المنافس الثاني', platform: 'instagram', username: 'comp2', spend: 20000 },
        { name: 'المنافس الثالث', platform: 'facebook', username: 'comp3', spend: 8000 },
      ]) {
        await tx.competitor.create({ data: { userId, name: comp.name, platform: comp.platform, platformUsername: comp.username, estimatedSpend: comp.spend, activeAdsCount: randomInt(3, 15) } });
      }

      for (const n of [
        { type: 'system', title: 'مرحباً بك في MARKETRON', message: 'تم إنشاء حسابك بنجاح.' },
        { type: 'campaign', title: 'تم إضافة بيانات تجريبية', message: 'تمت إضافة حملات تجريبية.' },
        { type: 'alert', title: 'رصيدك الافتتاحي', message: 'لديك 500 توكن مجاني.' },
      ]) {
        await tx.notification.create({ data: { userId, ...n } });
      }

      const inbox = await tx.socialInbox.create({ data: { userId, name: 'الوارد الموحد', platform: 'facebook', isActive: true } });
      for (let i = 0; i < 5; i++) {
        await tx.socialMessage.create({
          data: {
            inboxId: inbox.id, userId, platform: 'facebook',
            direction: 'inbound', status: i < 2 ? 'unread' : 'read',
            senderName: `عميل ${i + 1}`, senderId: `user_${i + 1}`,
            messageText: ['مرحباً، كم سعر المنتج؟', 'هل لديكم عروض للشركات؟', 'أرغب في استشارة تسويقية', 'شكراً على الخدمة', 'هل توفرون تصميم إعلانات؟'][i],
            createdAt: daysAgo(i),
          },
        });
      }
    });

    logger.info(`Demo data seeded for user ${userId}`);
    return { message: 'تمت إضافة البيانات التجريبية بنجاح', created: true, campaignsCount: campaignTemplates.length };
  }
}

export const demoDataService = new DemoDataService();
