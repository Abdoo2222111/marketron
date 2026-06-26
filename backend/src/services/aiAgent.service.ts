import prisma from '../config/database';
import { ApiError } from '../utils/apiError';

export class AiAgentService {
  // Get available agent types
  getAgentTypes() {
    return [
      { id: 'campaign_agent', name: 'وكيل الحملات', icon: 'Megaphone', description: 'خبير في إدارة وتحسين الحملات الإعلانية', color: 'blue' },
      { id: 'content_agent', name: 'وكيل المحتوى', icon: 'FileText', description: 'متخصص في إنشاء المحتوى الإعلاني والنصوص', color: 'green' },
      { id: 'analytics_agent', name: 'وكيل التحليلات', icon: 'BarChart3', description: 'محلل بيانات الحملات والإعلانات', color: 'purple' },
      { id: 'market_research_agent', name: 'وكيل أبحاث السوق', icon: 'Search', description: 'خبير في تحليل السوق والمنافسين', color: 'orange' },
      { id: 'social_agent', name: 'وكيل التواصل', icon: 'MessageCircle', description: 'مسؤول عن إدارة صندوق الرسائل الموحد', color: 'pink' },
      { id: 'whatsapp_agent', name: 'وكيل واتساب', icon: 'Phone', description: 'متخصص في إرسال واستقبال رسائل واتساب', color: 'emerald' },
      { id: 'support_agent', name: 'وكيل الدعم', icon: 'Headphones', description: 'للرد على استفسارات العملاء والدعم الفني', color: 'indigo' },
      { id: 'general_agent', name: 'وكيل عام', icon: 'Bot', description: 'مساعد ذكي للإجابة على أي استفسار', color: 'slate' },
    ];
  }

  // ── Agent CRUD ────────────────────────────────────────
  async createAgent(userId: string, data: {
    name: string;
    type: string;
    description?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const agent = await prisma.aiAgent.create({
      data: {
        userId,
        name: data.name,
        type: data.type as any,
        description: data.description,
        systemPrompt: data.systemPrompt || this.getDefaultPrompt(data.type),
        temperature: data.temperature || 0.7,
        maxTokens: data.maxTokens || 2000,
        tools: JSON.stringify(this.getDefaultTools(data.type)),
      },
    });
    return agent;
  }

  async listAgents(userId: string) {
    return prisma.aiAgent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgent(userId: string, agentId: string) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');
    return agent;
  }

  async updateAgent(userId: string, agentId: string, data: any) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');
    return prisma.aiAgent.update({ where: { id: agentId }, data });
  }

  async deleteAgent(userId: string, agentId: string) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');
    await prisma.aiAgent.delete({ where: { id: agentId } });
    return { message: 'تم حذف الوكيل بنجاح' };
  }

  // ── Chat ──────────────────────────────────────────────
  async sendMessage(userId: string, agentId: string, content: string) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');

    // Save user message
    await prisma.aiAgentMessage.create({
      data: { agentId, userId, role: 'user', content },
    });

    // Get conversation history
    const history = await prisma.aiAgentMessage.findMany({
      where: { agentId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    // Generate AI response (in production, call OpenAI)
    const aiResponse = this.generateResponse(agent, content, history);

    // Save AI response
    await prisma.aiAgentMessage.create({
      data: {
        agentId,
        userId,
        role: 'assistant',
        content: aiResponse,
        metadata: JSON.stringify({ modelUsed: agent.modelName, tokensUsed: Math.floor(Math.random() * 500) + 100 }),
      },
    });

    return { role: 'assistant', content: aiResponse };
  }

  async getConversation(userId: string, agentId: string) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');

    const messages = await prisma.aiAgentMessage.findMany({
      where: { agentId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return { agent, messages };
  }

  async clearConversation(userId: string, agentId: string) {
    const agent = await prisma.aiAgent.findFirst({
      where: { id: agentId, userId },
    });
    if (!agent) throw ApiError.notFound('الوكيل غير موجود');

    await prisma.aiAgentMessage.deleteMany({ where: { agentId } });
    return { message: 'تم مسح المحادثة' };
  }

  // ── Reply Rules ──────────────────────────────────────
  async createReplyRule(userId: string, data: {
    name: string;
    platform?: string;
    triggerType: string;
    triggerValue?: string;
    responseTemplate?: string;
    useAi: boolean;
    aiPrompt?: string;
    agentId?: string;
  }) {
    return prisma.aiReplyRule.create({
      data: {
        userId,
        name: data.name,
        platform: data.platform as any,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        responseTemplate: data.responseTemplate,
        useAi: data.useAi,
        aiPrompt: data.aiPrompt,
        agentId: data.agentId,
      },
    });
  }

  async listReplyRules(userId: string) {
    return prisma.aiReplyRule.findMany({
      where: { userId },
      orderBy: { priority: 'desc' },
      include: { agent: { select: { id: true, name: true, type: true } } },
    });
  }

  async updateReplyRule(userId: string, ruleId: string, data: any) {
    const rule = await prisma.aiReplyRule.findFirst({
      where: { id: ruleId, userId },
    });
    if (!rule) throw ApiError.notFound('القاعدة غير موجودة');
    return prisma.aiReplyRule.update({ where: { id: ruleId }, data });
  }

  async deleteReplyRule(userId: string, ruleId: string) {
    const rule = await prisma.aiReplyRule.findFirst({
      where: { id: ruleId, userId },
    });
    if (!rule) throw ApiError.notFound('القاعدة غير موجودة');
    await prisma.aiReplyRule.delete({ where: { id: ruleId } });
    return { message: 'تم حذف القاعدة بنجاح' };
  }

  // ── Private Helpers ───────────────────────────────────
  private getDefaultPrompt(type: string): string {
    const prompts: Record<string, string> = {
      campaign_agent: 'أنت خبير في إدارة الحملات الإعلانية على فيسبوك، إنستجرام، تيك توك وسناب شات. ساعد المستخدم في تحسين حملاته، اختيار الجمهور المناسب، تحديد الميزانيات، وتحليل الأداء.',
      content_agent: 'أنت خبير في إنشاء المحتوى الإعلاني. تساعد في كتابة نصوص إعلانية جذابة، اقتراح أفكار إبداعية، تحسين العناوين، واختيار الصور المناسبة.',
      analytics_agent: 'أنت محلل بيانات متخصص في تحليل أداء الحملات الإعلانية. تقرأ الأرقام وتستخرج الرؤى والتوصيات.',
      market_research_agent: 'أنت خبير أبحاث سوق. تحلل الأسواق، المنافسين، اتجاهات السوق، وتقدم توصيات استراتيجية.',
      social_agent: 'أنت مساعد ذكي لإدارة صندوق الرسائل الموحد. ترد على العملاء بلباقة واحترافية.',
      whatsapp_agent: 'أنت وكيل واتساب ذكي. ترد على رسائل العملاء عبر واتساب بطريقة مهنية واحترافية.',
      support_agent: 'أنت وكيل دعم فني متخصص. تساعد في حل مشاكل العملاء وتقديم الدعم الفني.',
      general_agent: 'أنت مساعد ذكي متعدد المهام. تجيب على أي استفسار يتعلق بالتسويق الإلكتروني وإدارة الحملات.',
    };
    return prompts[type] || prompts.general_agent;
  }

  private getDefaultTools(type: string): any[] {
    const baseTools = ['chat', 'search'];
    const toolsByType: Record<string, string[]> = {
      campaign_agent: [...baseTools, 'campaign_analytics', 'budget_calculator'],
      content_agent: [...baseTools, 'content_generator', 'image_generator'],
      analytics_agent: [...baseTools, 'data_analyzer', 'report_generator'],
      market_research_agent: [...baseTools, 'market_analyzer', 'competitor_tracker'],
      social_agent: [...baseTools, 'message_reader', 'auto_reply'],
      whatsapp_agent: [...baseTools, 'whatsapp_sender', 'template_manager'],
    };
    return toolsByType[type] || baseTools;
  }

  private generateResponse(agent: any, userMessage: string, history: any[]): string {
    const typeLabels: Record<string, string> = {
      campaign_agent: 'حملاتك الإعلانية',
      content_agent: 'المحتوى الإعلاني',
      analytics_agent: 'تحليلات البيانات',
      market_research_agent: 'أبحاث السوق',
      social_agent: 'التواصل مع العملاء',
      whatsapp_agent: 'رسائل واتساب',
      support_agent: 'الدعم الفني',
      general_agent: 'استفسارك',
    };

    return `مرحباً! أنا ${agent.name} 🎯

استلمت استفسارك بخصوص "${typeLabels[agent.type] || 'استفسارك'}".

رسالتك: "${userMessage}"

${
  agent.type === 'campaign_agent'
    ? `لتحسين حملاتك، أنصحك بـ:
1. مراجعة الجمهور المستهدف بدقة
2. اختبار A/B للنصوص الإعلانية
3. تحليل أوقات الذروة للتفاعل
4. تحسين الصفحات المقصودة`
  : agent.type === 'content_agent'
    ? `لإنشاء محتوى أفضل:
1. استخدم عنوان قوي يجذب الانتباه
2. ركز على فوائد المنتج وليس الميزات
3. أضف Call-to-Action واضح
4. استخدم صور عالية الجودة`
  : agent.type === 'analytics_agent'
    ? `تحليل الأداء:
${history.length > 2 ? 'بناءً على بيانات حملاتك، لاحظت أن الأداء يمكن تحسينه عن طريق تحسين الاستهداف.' : 'شارك معي بيانات حملاتك لتحليل أدائها وتقديم توصيات مخصصة.'}`
  : 'كيف أقدر أساعدك أكثر؟ هل تريد تفاصيل محددة؟'
}

هل تريد مني توضيح أي نقطة بشكل أعمق؟ 😊`;
  }
}

export const aiAgentService = new AiAgentService();
