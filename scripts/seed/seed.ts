// Database seeding script
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ── Create Admin User ──────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@marketing-platform.com' },
    update: {},
    create: {
      name: 'مدير المنصة',
      email: 'admin@marketing-platform.com',
      passwordHash: adminPassword,
      role: 'admin',
      company: 'منصة التسويق الإلكتروني',
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ── Create Demo Client ────────────────────────────────
  const clientPassword = await bcrypt.hash('Client@123456', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: {},
    create: {
      name: 'شركة الأفق للتجارة',
      email: 'client@demo.com',
      passwordHash: clientPassword,
      role: 'client',
      company: 'شركة الأفق للتجارة',
      isActive: true,
    },
  });

  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: {},
    create: {
      userId: client.id,
      companyName: 'شركة الأفق للتجارة',
      companySize: '50-100',
      industry: 'التجارة الإلكترونية',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      settings: { currency: 'SAR', timezone: 'Asia/Riyadh', language: 'ar' },
    },
  });
  console.log(`✅ Demo client created: ${client.email}`);

  // ── Create Client Workspace ───────────────────────────
  const workspace = await prisma.clientWorkspace.upsert({
    where: { id: 'demo-workspace-001' },
    update: {},
    create: {
      id: 'demo-workspace-001',
      ownerId: client.id,
      companyName: 'شركة الأفق للتجارة',
      companySize: '50-100',
      industry: 'التجارة الإلكترونية',
      country: 'المملكة العربية السعودية',
      status: 'active',
      subscriptionTier: 'professional',
      subscriptionEndsAt: new Date('2027-01-01'),
      maxUsers: 10,
      maxCampaigns: 50,
    },
  });

  await prisma.workspaceClient.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: client.id } },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: client.id,
      role: 'owner',
      permissions: ['all'],
    },
  });
  console.log('✅ Workspace created');

  // ── Create AI Agents ──────────────────────────────────
  const agentTypes = [
    { name: 'وكيل الحملات', type: 'campaign_agent', desc: 'خبير في إدارة وتحسين الحملات الإعلانية' },
    { name: 'وكيل المحتوى', type: 'content_agent', desc: 'متخصص في إنشاء المحتوى الإعلاني' },
    { name: 'وكيل التحليلات', type: 'analytics_agent', desc: 'محلل بيانات الحملات والإعلانات' },
    { name: 'وكيل أبحاث السوق', type: 'market_research_agent', desc: 'خبير في تحليل السوق والمنافسين' },
    { name: 'وكيل التواصل', type: 'social_agent', desc: 'إدارة صندوق الرسائل الموحد' },
    { name: 'وكيل واتساب', type: 'whatsapp_agent', desc: 'إرسال واستقبال رسائل واتساب' },
    { name: 'وكيل عام', type: 'general_agent', desc: 'مساعد ذكي متعدد المهام' },
  ];

  for (const agent of agentTypes) {
    await prisma.aiAgent.upsert({
      where: { id: `demo-agent-${agent.type}` },
      update: {},
      create: {
        id: `demo-agent-${agent.type}`,
        userId: client.id,
        name: agent.name,
        type: agent.type as any,
        description: agent.desc,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${agentTypes.length} AI agents created`);

  // ── Create Demo Campaigns ─────────────────────────────
  const campaigns = [
    { name: 'حملة عيد الأضحى', platform: 'facebook', objective: 'conversions', budget: 15000, status: 'active', impressions: 125000, clicks: 8900, conversions: 345, spend: 4500, revenue: 14400 },
    { name: 'حملة الربيع', platform: 'instagram', objective: 'awareness', budget: 10000, status: 'active', impressions: 98000, clicks: 6700, conversions: 234, spend: 3200, revenue: 8960 },
    { name: 'تخفيضات الصيف', platform: 'tiktok', objective: 'engagement', budget: 8000, status: 'paused', impressions: 245000, clicks: 12000, conversions: 189, spend: 2800, revenue: 11480 },
    { name: 'إطلاق منتج جديد', platform: 'snapchat', objective: 'traffic', budget: 6000, status: 'active', impressions: 76000, clicks: 4300, conversions: 156, spend: 2100, revenue: 5460 },
    { name: 'العودة للمدارس', platform: 'facebook', objective: 'sales', budget: 5000, status: 'completed', impressions: 54000, clicks: 3200, conversions: 98, spend: 1800, revenue: 6800 },
  ];

  for (const camp of campaigns) {
    await prisma.campaign.upsert({
      where: { id: `demo-camp-${camp.name}` },
      update: {},
      create: {
        id: `demo-camp-${camp.name}`,
        userId: client.id,
        platform: camp.platform as any,
        name: camp.name,
        objective: camp.objective as any,
        status: camp.status as any,
        budgetType: 'lifetime',
        budgetAmount: camp.budget,
        budgetCurrency: 'SAR',
        startDate: new Date('2026-01-01'),
        impressions: camp.impressions,
        clicks: camp.clicks,
        conversions: camp.conversions,
        spend: camp.spend,
        revenue: camp.revenue,
        ctr: (camp.clicks / camp.impressions) * 100,
        cpc: camp.clicks > 0 ? camp.spend / camp.clicks : 0,
        cpa: camp.conversions > 0 ? camp.spend / camp.conversions : 0,
        roas: camp.spend > 0 ? camp.revenue / camp.spend : 0,
      },
    });
  }
  console.log(`✅ ${campaigns.length} demo campaigns created`);

  // ── Create Social Inbox (WhatsApp) ────────────────────
  const inbox = await prisma.socialInbox.upsert({
    where: { id: 'demo-inbox-whatsapp' },
    update: {},
    create: {
      id: 'demo-inbox-whatsapp',
      userId: client.id,
      name: 'واتساب الأعمال',
      platform: 'whatsapp',
      phoneNumber: '+966501234567',
      isActive: true,
    },
  });

  // Add some demo messages
  const messages = [
    { text: 'السلام عليكم، عندي استفسار عن المنتج الجديد', sender: 'أحمد محمد', status: 'unread' },
    { text: 'متى تتوفر الشحنة؟', sender: 'سارة أحمد', status: 'unread' },
    { text: 'كم سعر المنتج؟', sender: 'نورة سعد', status: 'read' },
    { text: 'شكراً لكم على الخدمة الممتازة', sender: 'فهد عبدالله', status: 'replied', aiReply: 'الشكر لله، نحن في خدمتك دائماً! 😊' },
  ];

  for (const msg of messages) {
    await prisma.socialMessage.upsert({
      where: { id: `demo-msg-${Date.now()}-${Math.random()}` },
      update: {},
      create: {
        id: `demo-msg-${Date.now()}-${Math.random()}`,
        inboxId: inbox.id,
        userId: client.id,
        platform: 'whatsapp',
        direction: 'inbound',
        status: msg.status as any,
        senderName: msg.sender,
        messageText: msg.text,
        aiReplyText: msg.aiReply || null,
        replyFromAi: !!msg.aiReply,
      },
    });
  }
  console.log('✅ Social inbox + messages created');

  // ── Create AI Reply Rules ────────────────────────────
  const rules = [
    { name: 'تحية تلقائية', triggerValue: 'السلام,مرحبا,مساء الخير,صباح الخير', priority: 1 },
    { name: 'استفسار سعر', triggerValue: 'السعر,كم سعر,كم ثمن,بكم', priority: 2 },
    { name: 'استفسار توفر', triggerValue: 'متوفر,يتوفر,متاحة,موجود', priority: 3 },
  ];

  for (const rule of rules) {
    await prisma.aiReplyRule.upsert({
      where: { id: `demo-rule-${rule.name}` },
      update: {},
      create: {
        id: `demo-rule-${rule.name}`,
        userId: client.id,
        name: rule.name,
        triggerType: 'keyword',
        triggerValue: rule.triggerValue,
        useAi: true,
        isActive: true,
        priority: rule.priority,
      },
    });
  }
  console.log(`✅ ${rules.length} auto-reply rules created`);

  console.log('\n🎉 Database seeding completed!');
  console.log('📧 Admin: admin@marketing-platform.com / Admin@123456');
  console.log('📧 Client: client@demo.com / Client@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
