import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

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

async function seed() {
  console.log('🔄 Seeding database...');

  // Clean existing data in correct order (child first)
  await prisma.whatsAppSession.deleteMany();
  await prisma.socialMessage.deleteMany();
  await prisma.socialInbox.deleteMany();
  await prisma.aiAgentMessage.deleteMany();
  await prisma.aiReplyRule.deleteMany();
  await prisma.aiAgent.deleteMany();
  await prisma.aiGeneration.deleteMany();
  await prisma.adSnapshot.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.competitorAd.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.content.deleteMany();
  await prisma.marketReport.deleteMany();
  await prisma.analyticsReport.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.userCredits.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.platformConnection.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('  Cleaned existing data');

  const hash = await bcrypt.hash('Admin@123456', 12);

  // ── Create users ──
  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'مدير المنصة',
      email: 'admin@marketing-platform.com',
      passwordHash: hash,
      role: 'admin',
      company: 'MARKETRON',
      isActive: true,
    },
  });

  const client = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'أحمد محمد',
      email: 'client@demo.com',
      passwordHash: hash,
      role: 'client',
      company: 'شركة النجاح للتسويق',
      phone: '+966501234567',
      isActive: true,
    },
  });

  const agency = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'سارة خالد',
      email: 'agency@demo.com',
      passwordHash: await bcrypt.hash('Agency@123456', 12),
      role: 'client',
      company: 'وكالة الإبداع للتسويق',
      phone: '+966501234568',
      isActive: true,
    },
  });

  const test = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'مستخدم تجريبي',
      email: 'test@marketron.io',
      passwordHash: hash,
      role: 'client',
      company: 'شركة تجريبية',
      isActive: true,
    },
  });

  console.log('  ✅ 4 users created');

  // ── Create client profiles ──
  await prisma.clientProfile.create({
    data: {
      userId: client.id,
      companyName: 'شركة النجاح للتسويق',
      companySize: '50-100',
      industry: 'تسويق رقمي',
      country: 'SA',
      city: 'الرياض',
    },
  });

  await prisma.clientProfile.create({
    data: {
      userId: agency.id,
      companyName: 'وكالة الإبداع للتسويق',
      companySize: '10-50',
      industry: 'وكالة إعلان',
      country: 'SA',
      city: 'جدة',
    },
  });

  // ── Create credits for each user ──
  const users = [admin, client, agency, test];
  for (const user of users) {
    await prisma.userCredits.create({
      data: {
        userId: user.id,
        balance: user.role === 'admin' ? 10000 : 500,
        totalSpent: 0,
        totalPurchased: user.role === 'admin' ? 10000 : 500,
      },
    });
  }
  console.log('  ✅ Credits created');

  // ── Create subscription for client ──
  await prisma.subscription.create({
    data: {
      userId: client.id,
      plan: 'professional',
      status: 'active',
      currentPeriodStart: daysAgo(30),
      currentPeriodEnd: daysLater(30),
    },
  });

  // ── Create platform connections ──
  const platforms = [
    { userId: client.id, platform: 'facebook', token: 'EAATestFacebookToken123', accountId: 'fb_page_123', name: 'صفحة الشركة على فيسبوك' },
    { userId: client.id, platform: 'instagram', token: 'IGTestToken456', accountId: 'ig_account_456', name: 'حساب إنستغرام الرسمي' },
    { userId: client.id, platform: 'telegram', token: 'TeleBotToken789', accountId: 'telegram_channel_789', name: 'قناة تيليجرام' },
    { userId: agency.id, platform: 'facebook', token: 'EAATestAgencyToken', accountId: 'fb_agency_page', name: 'صفحة الوكالة' },
  ];

  for (const p of platforms) {
    await prisma.platformConnection.create({
      data: {
        userId: p.userId,
        platform: p.platform,
        accessToken: p.token,
        platformAccountId: p.accountId,
        platformAccountName: p.name,
        status: 'active',
      },
    });
  }
  console.log('  ✅ Platform connections created');

  // ── Create campaigns ──
  const campaignData = [
    { userId: client.id, name: 'حملة إطلاق المنتج الجديد', platform: 'facebook', objective: 'awareness', status: 'active', budget: 5000, startDate: daysAgo(45), endDate: daysLater(15) },
    { userId: client.id, name: 'حملة مبيعات موسم الصيف', platform: 'instagram', objective: 'sales', status: 'active', budget: 8000, startDate: daysAgo(30), endDate: daysLater(30) },
    { userId: client.id, name: 'حملة زيادة التفاعل', platform: 'facebook', objective: 'engagement', status: 'paused', budget: 3000, startDate: daysAgo(60), endDate: daysAgo(5) },
    { userId: client.id, name: 'حملة جذب العملاء', platform: 'instagram', objective: 'leads', status: 'draft', budget: 4000, startDate: null, endDate: null },
    { userId: client.id, name: 'حملة العودة للمدارس', platform: 'facebook', objective: 'traffic', status: 'completed', budget: 2000, startDate: daysAgo(90), endDate: daysAgo(30) },
    { userId: agency.id, name: 'حملة العميل أ', platform: 'facebook', objective: 'sales', status: 'active', budget: 10000, startDate: daysAgo(20), endDate: daysLater(40) },
    { userId: agency.id, name: 'حملة العميل ب', platform: 'instagram', objective: 'awareness', status: 'active', budget: 6000, startDate: daysAgo(15), endDate: daysLater(15) },
  ];

  const campaigns: any[] = [];
  for (const c of campaignData) {
    const campaign = await prisma.campaign.create({
      data: {
        userId: c.userId,
        name: c.name,
        platform: c.platform,
        objective: c.objective,
        status: c.status,
        budgetType: 'daily',
        budgetAmount: c.budget,
        budgetCurrency: 'USD',
        startDate: c.startDate,
        endDate: c.endDate,
        impressions: randomInt(10000, 200000),
        clicks: randomInt(500, 10000),
        conversions: randomInt(10, 500),
        spend: randomFloat(500, 5000),
        ctr: randomFloat(1, 5),
        cpc: randomFloat(0.5, 3),
        cpm: randomFloat(5, 20),
        cpa: randomFloat(10, 100),
        revenue: randomFloat(1000, 50000),
        roas: randomFloat(1, 5),
      },
    });
    campaigns.push(campaign);
  }
  console.log(`  ✅ ${campaigns.length} campaigns created`);

  // ── Create ads for campaigns ──
  const adTemplates = [
    { name: 'إعلان فيديو تعريفي', text: 'اكتشف منتجنا الجديد! عرض حصري لفترة محدودة.', headline: 'منتج ثوري في عالم التسويق', cta: 'تسوق الآن' },
    { name: 'إعلان صور المنتج', text: 'جودة عالية - سعر مميز - توصيل مجاني', headline: 'الجودة التي تبحث عنها', cta: 'اعرف أكثر' },
    { name: 'إعلان قصة نجاح', text: 'قصص نجاح عملائنا تتحدث عن نفسها... انضم إليهم اليوم', headline: 'انضم لأكثر من ١٠٠٠ عميل', cta: 'سجل الآن' },
    { name: 'إعلان عرض خاص', text: 'خصم ٣٠٪ لفترة محدودة. لا تفوت الفرصة!', headline: 'عرض الصيف', cta: 'استفد من العرض' },
  ];

  for (const campaign of campaigns.slice(0, 5)) {
    for (const tmpl of adTemplates) {
      await prisma.ad.create({
        data: {
          campaignId: campaign.id,
          platform: campaign.platform,
          name: `${tmpl.name} - ${campaign.name}`,
          status: campaign.status === 'active' ? 'active' : 'paused',
          creativeText: tmpl.text,
          creativeHeadline: tmpl.headline,
          creativeCta: tmpl.cta,
          impressions: randomInt(1000, 50000),
          clicks: randomInt(50, 3000),
          conversions: randomInt(1, 50),
          spend: randomFloat(50, 1000),
          ctr: randomFloat(1, 8),
          cpc: randomFloat(0.3, 3),
          cpm: randomFloat(3, 15),
          cpa: randomFloat(5, 80),
        },
      });
    }
  }
  console.log('  ✅ Ads created');

  // ── Create ad snapshots (daily data for last 30 days) ──
  for (const campaign of campaigns) {
    for (let day = 0; day < 30; day++) {
      const impressions = randomInt(100, 5000);
      const clicks = randomInt(5, Math.floor(impressions * 0.08));
      const conversions = randomInt(0, 20);
      const spend = randomFloat(10, 300);
      const revenue = conversions * randomFloat(10, 100);

      await prisma.adSnapshot.create({
        data: {
          campaignId: campaign.id,
          platform: campaign.platform,
          date: daysAgo(day),
          impressions: impressions,
          clicks: clicks,
          conversions: conversions,
          spend: spend,
          ctr: impressions > 0 ? clicks / impressions : 0,
          cpc: clicks > 0 ? spend / clicks : 0,
          cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
          cpa: conversions > 0 ? spend / conversions : 0,
          revenue: revenue,
        },
      });
    }
  }
  console.log('  ✅ Ad snapshots created (30 days per campaign)');

  // ── Create content pieces ──
  const contentItems = [
    { userId: client.id, type: 'image', title: 'منتجنا الجديد - جودة لا تضاهى', description: 'اكتشف أحدث منتجاتنا', tags: ['منتج', 'جديد', 'جودة'] },
    { userId: client.id, type: 'video', title: 'عرض الصيف - خصم 30%', description: 'الصيف هذا السنة مختلف!', tags: ['عرض', 'الصيف', 'تخفيضات'] },
    { userId: client.id, type: 'carousel', title: 'نصائح تسويقية', description: 'أفضل نصائح التسويق لعام 2026', tags: ['نصائح', 'تسويق', 'digital'] },
    { userId: client.id, type: 'image', title: 'إطلاق الحملة الجديدة', description: 'انطلاق أقوى حملاتنا لهذا الموسم', tags: ['حملة', 'إطلاق'] },
    { userId: agency.id, type: 'image', title: 'تصميم إعلاني للعميل أ', description: 'تصميم إعلاني احترافي', tags: ['تصميم', 'إعلان'] },
  ];

  for (const item of contentItems) {
    await prisma.content.create({
      data: {
        userId: item.userId,
        type: item.type,
        title: item.title,
        description: item.description,
        fileUrl: `/uploads/${item.type}s/${uuidv4()}.jpg`,
        tags: JSON.stringify(item.tags),
      },
    });
  }
  console.log('  ✅ Content pieces created');

  // ── Create competitors ──
  const competitorData = [
    { userId: client.id, name: 'شركة المنافس الأول', platform: 'facebook', username: 'competitor1', notes: 'منافس قوي في السوق السعودي', spend: 15000 },
    { userId: client.id, name: 'شركة المنافس الثاني', platform: 'instagram', username: 'competitor2', notes: 'منافس نشط على إنستغرام', spend: 20000 },
    { userId: client.id, name: 'شركة المنافس الثالث', platform: 'facebook', username: 'competitor3', notes: 'منافس صاعد', spend: 5000 },
    { userId: agency.id, name: 'وكالة منافسة', platform: 'instagram', username: 'agency_comp', notes: 'وكالة إعلان منافسة', spend: 25000 },
  ];

  for (const comp of competitorData) {
    await prisma.competitor.create({
      data: {
        userId: comp.userId,
        name: comp.name,
        platform: comp.platform,
        platformUsername: comp.username,
        notes: comp.notes,
        estimatedSpend: comp.spend,
        activeAdsCount: randomInt(3, 15),
      },
    });
  }
  console.log('  ✅ Competitors created');

  // ── Create market reports ──
  const reports = [
    {
      userId: client.id,
      productName: 'منصة تسويق رقمي',
      category: 'تكنولوجيا',
      country: 'السعودية',
      summary: 'سوق التسويق الرقمي في السعودية ينمو بنسبة 15% سنوياً',
    },
    {
      userId: client.id,
      productName: 'متجر إلكتروني',
      category: 'تجارة إلكترونية',
      country: 'الإمارات',
      summary: 'التجارة الإلكترونية في الإمارات تشهد نمواً متسارعاً',
    },
  ];

  for (const r of reports) {
    await prisma.marketReport.create({
      data: {
        userId: r.userId,
        productName: r.productName,
        productCategory: r.category,
        country: r.country,
        reportData: JSON.stringify({
          marketSize: '5 مليار دولار',
          growth: '15% سنوياً',
          topTrends: ['التسويق عبر المؤثرين', 'محتوى الفيديو', 'التجارة الاجتماعية'],
          competitors: ['شركة أ', 'شركة ب', 'شركة ج'],
          recommendations: ['التركيز على محتوى الفيديو', 'زيادة الإنفاق على التسويق عبر المؤثرين'],
        }),
        reportSummary: r.summary,
      },
    });
  }
  console.log('  ✅ Market reports created');

  // ── Create AI agents ──
  const agentTypes = [
    { name: 'مساعد المحتوى', type: 'content', prompt: 'أنت مساعد متخصص في إنشاء المحتوى التسويقي باللغة العربية. ساعد المستخدم في كتابة نصوص إعلانية وصور تسويقية.' },
    { name: 'محلل الحملات', type: 'analytics', prompt: 'أنت محلل حملات إعلانية متخصص. حلل بيانات الحملات وقدم توصيات للتحسين.' },
    { name: 'مستشار استراتيجي', type: 'strategy', prompt: 'أنت مستشار تسويق استراتيجي. قدم نصائح وحلول متكاملة للاستراتيجيات التسويقية.' },
    { name: 'خدمة العملاء', type: 'support', prompt: 'أنت مساعد خدمة عملاء متخصص في الرد على استفسارات العملاء بشكل احترافي.' },
  ];

  for (const agent of agentTypes) {
    await prisma.aiAgent.create({
      data: {
        userId: client.id,
        name: agent.name,
        type: agent.type,
        systemPrompt: agent.prompt,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
        isActive: true,
      },
    });
  }
  console.log('  ✅ AI agents created');

  // ── Create social inboxes and messages ──
  const inbox = await prisma.socialInbox.create({
    data: {
      userId: client.id,
      name: 'الوارد الموحد',
      platform: 'facebook',
      platformAccountId: 'fb_page_123',
    },
  });

  const messageTexts = [
    'مرحباً، كم سعر المنتج الجديد؟',
    'هل لديكم خصومات للشركات الناشئة؟',
    'أرغب في طلب استشارة تسويقية',
    'شكراً لكم على الخدمة الممتازة',
    'هل توفرون خدمات التصميم؟',
    'متى موعد إطلاق الحملة الجديدة؟',
    'أريد معرفة المزيد عن الباقة الاحترافية',
    'هل الشحن مجاني للطلبات الكبيرة؟',
  ];

  for (let i = 0; i < 8; i++) {
    await prisma.socialMessage.create({
      data: {
        inboxId: inbox.id,
        userId: client.id,
        platform: 'facebook',
        direction: i < 5 ? 'inbound' : 'outbound',
        status: i < 3 ? 'unread' : 'read',
        senderName: `عميل ${i + 1}`,
        senderId: `user_${i + 1}`,
        messageText: messageTexts[i],
        createdAt: daysAgo(i),
      },
    });
  }
  console.log('  ✅ Social inbox with messages created');

  // ── Create notifications ──
  const notifications = [
    { userId: client.id, type: 'system', title: 'تم ربط صفحة فيسبوك بنجاح', message: 'تم ربط صفحة الشركة على فيسبوك مع المنصة.' },
    { userId: client.id, type: 'campaign', title: 'حملة إطلاق المنتج الجديد نشطة الآن', message: 'حملتك تعمل بكفاءة. نسبة النقر إلى الظهور: 3.2%' },
    { userId: client.id, type: 'alert', title: 'تم استهلاك 50% من رصيدك', message: 'لديك 250 توكن متبقي. قم بشحن رصيدك.' },
    { userId: client.id, type: 'message', title: 'رسالة جديدة من عميل', message: 'لديك 3 رسائل غير مقروءة في الوارد الموحد.' },
    { userId: client.id, type: 'system', title: 'تم تحديث المنصة', message: 'تم تحديث المنصة إلى الإصدار 2.0.0' },
    { userId: agency.id, type: 'system', title: 'مرحباً بك في MARKETRON', message: 'تم تفعيل حساب الوكالة بنجاح.' },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }
  console.log('  ✅ Notifications created');

  // ── Create workspace (using Organization model) ──
  const workspace = await prisma.organization.create({
    data: {
      name: 'وكالة الإبداع للتسويق',
      companySize: '10-50',
      industry: 'وكالة إعلان',
    },
  });
  console.log('  ✅ Workspace (Organization) created');

  // ── Create credit transactions ──
  await prisma.creditTransaction.create({
    data: {
      userId: client.id,
      amount: 500,
      type: 'purchase',
      description: 'شراء حزمة 500 توكن',
      balanceAfter: 500,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: client.id,
      amount: -10,
      type: 'spend',
      description: 'توليد محتوى باستخدام AI',
      balanceAfter: 490,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: client.id,
      amount: -5,
      type: 'spend',
      description: 'تحليل حملة إعلانية',
      balanceAfter: 485,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: client.id,
      amount: 100,
      type: 'bonus',
      description: 'مكافأة ترحيبية',
      balanceAfter: 600,
    },
  });
  console.log('  ✅ Credit transactions created');

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ Database seeded successfully!');
  console.log('');
  console.log('  📧 Test Accounts:');
  console.log('  • admin@marketing-platform.com / Admin@123456 (admin)');
  console.log('  • client@demo.com / Admin@123456 (client)');
  console.log('  • test@marketron.io / Admin@123456 (client)');
  console.log('  • agency@demo.com / Agency@123456 (agency)');
  console.log('');
  console.log('  📊 Data created:');
  console.log(`  • ${campaigns.length} campaigns with ads & 30 days of analytics`);
  console.log('  • Platform connections (Facebook, Instagram, Telegram)');
  console.log('  • Content, competitors, market reports, AI agents');
  console.log('  • Social inbox with messages, notifications, workspace');
  console.log('  • Credit system with transactions');
  console.log('═══════════════════════════════════════════');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
