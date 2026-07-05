// ============================================================
// Enhanced AI Auto-Reply Engine
// ============================================================
// Features:
// - Intent Detection (بيع, دعم, شكوى, استفسار, عام)
// - Sentiment Analysis (إيجابي, محايد, سلبي, غاضب)
// - Conversation Context Memory
// - Arabic-Optimized Prompts
// - Smart Agent Routing
// - Rate Limiting & Queue Management
// ============================================================

import { PrismaClient } from '@prisma/client';
import { aiService } from '../integrations/aiService';
import { evolutionApi } from '../integrations/evolutionApi';
import { telegramApi } from '../integrations/telegramApi';
import { metaGraph } from '../integrations/metaGraph';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// ── Types ──────────────────────────────────────────────

type IntentType = 'sale' | 'support' | 'complaint' | 'inquiry' | 'greeting' | 'feedback' | 'urgent' | 'general';
type SentimentType = 'positive' | 'neutral' | 'negative' | 'angry';
type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

interface MessageContext {
  conversationId: string;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userProfile?: {
    name?: string;
    isReturning: boolean;
    totalMessages: number;
    lastInteraction?: Date;
  };
}

interface IntentResult {
  intent: IntentType;
  confidence: number;
  sentiment: SentimentType;
  urgency: UrgencyLevel;
  language: 'ar' | 'en' | 'fr' | 'tr' | 'other';
  keywords: string[];
}

interface AutoReplyResult {
  shouldReply: boolean;
  replyText?: string;
  useAi: boolean;
  agentName?: string;
  confidence: number;
  escalateToHuman: boolean;
}

// ── Intent Patterns (Arabic-first) ─────────────────────

const INTENT_PATTERNS: Record<IntentType, RegExp[]> = {
  sale: [
    /(سعر|كم|شراء|طلب|اشتري|buy|price|cost|order|purchase)/i,
    /(عرض|خصم|تخفيض|offer|discount|sale|deal)/i,
    /(اشتراك|subscription|plan|باقة|package)/i,
  ],
  support: [
    /(مشكلة|عطل|خطأ|bug|error|issue|problem|help)/i,
    /(لا يعمل|not working|down|تعطل|توقف)/i,
    /(مساعدة|دعم|support|مساعدة)/i,
  ],
  complaint: [
    /(شكوى|مزعج|سيء|bad|terrible|worst|complaint)/i,
    /(استرجاع|refund|return|reimbursement)/i,
    /(غش|احتيال|scam|fraud|fake)/i,
  ],
  inquiry: [
    /(استفسار|سؤال|question|inquiry|info|information)/i,
    /(كيف|how|what|when|where|why|هل)/i,
    /(متى|أين|لماذا|ماذا|من)/i,
  ],
  greeting: [
    /(السلام|مرحبا|اهلا|hello|hi|hey|صباح|مساء)/i,
    /(good morning|good evening|marhaba|ahlan)/i,
  ],
  feedback: [
    /(اقتراح|suggestion|idea|recommend|feedback)/i,
    /(حلو|جميل|nice|good|great|excellent|ممتاز)/i,
  ],
  urgent: [
    /(عاجل|urgent|emergency|طارئ|حالا|فورا)/i,
    /(important|مهم|ضروري|critical|حرج)/i,
  ],
  general: [], // fallback
};

const SENTIMENT_PATTERNS: Record<SentimentType, RegExp[]> = {
  positive: [
    /(ممتاز|رائع|جميل|حلو|شكراً|thanks|great|excellent|perfect|awesome)/i,
    /(سعيد|happy|pleased|satisfied|راضي)/i,
  ],
  neutral: [
    /(ممكن|يمكن|maybe|perhaps|ok|حسنا|تمام)/i,
  ],
  negative: [
    /(سيء|مزعج|تعبان|not good|bad|terrible|worst)/i,
    /(غاضب|ضيق|angry|upset|frustrated)/i,
  ],
  angry: [
    /(!!+| furious|outraged|صراخ|شتم|swear|cursing)/i,
    /(حرام|عار|فضيحة|disgrace|unacceptable)/i,
  ],
};

// ── AI System Prompts (Arabic-optimized) ──────────────

const INTENT_CLASSIFIER_PROMPT = `أنت مساعد تحليل نوايا متخصص في منصة تسويق.

حلل الرسالة التالية وحدد:
1. النية (intent): sale, support, complaint, inquiry, greeting, feedback, urgent, general
2. المشاعر (sentiment): positive, neutral, negative, angry
3. درجة الاستعجال (urgency): low, medium, high, critical
4. اللغة: ar, en, fr, tr, other

أعد النتيجة كـ JSON فقط بهذا التنسيق:
{"intent":"","sentiment":"","urgency":"","language":"","confidence":0,"keywords":[]}

الرسالة: {message}`;

const AUTO_REPLY_SYSTEM_PROMPT = `أنت مساعد رد آلي متخصص في منصة MARKETRON للتسويق الإلكتروني.

شخصيتك:
- محترف، ودود، ومختص في التسويق والإعلانات
- تتكلم العربية الفصحى المبسطة (أو لغة العميل)
- تقدم حلولاً عملية ومحددة
- تستخدم نبرة إيجابية ومتفهمة

قواعد الرد:
1. إذا كان الاستفسار عن سعر أو خدمة: قدم معلومات مفيدة واترك الباب مفتوحاً للاستفسار
2. إذا كانت شكوى: اعتذر بتفهم واطلب تفاصيل أكثر للحل
3. إذا كان طلب دعم فني: قدم خطوات حل أولية وأكد أن الفريق سيتابع
4. إذا كان مجرد تحية: رحب ترحيباً لطيفاً واسأل عن احتياجاتهم
5. للمشكلات العاجلة: أبلغ أنه تم تصعيد الأمر للفريق المختص

معلومات عن المنصة:
- منصة MARKETRON: تسويق إلكتروني متكامل بالذكاء الاصطناعي
- تدير حملات فيسبوك، إنستغرام، تيك توك، سناب شات، جوجل
- توفر رد آلي عبر واتساب وفيسبوك ماسنجر
- تحليلات وتقارير متقدمة

الرسالة: {message}

النية المكتشفة: {intent}
المشاعر: {sentiment}
درجة الاستعجال: {urgency}

ردك (لا يتجاوز 200 كلمة):`;

// ── Main Engine ───────────────────────────────────────

export class AutoReplyEngine {
  private evolutionApi: typeof evolutionApi;
  private replyQueue: Map<string, number> = new Map();
  private readonly RATE_LIMIT = 30; // max replies per minute per user
  private readonly RATE_WINDOW = 60000; // 60 seconds

  constructor() {
    this.evolutionApi = evolutionApi;
  }

  /**
   * Analyze message intent using rule-based + AI classification
   */
  async analyzeIntent(message: string): Promise<IntentResult> {
    const result: IntentResult = {
      intent: 'general',
      confidence: 0,
      sentiment: 'neutral',
      urgency: 'low',
      language: this.detectLanguage(message),
      keywords: [],
    };

    // Rule-based intent detection
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          result.intent = intent as IntentType;
          result.confidence = Math.max(result.confidence, 0.6);
          result.keywords.push(match[0]);
        }
      }
    }

    // Rule-based sentiment detection
    for (const [sentiment, patterns] of Object.entries(SENTIMENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          result.sentiment = sentiment as SentimentType;
          break;
        }
      }
    }

    // Urgency detection
    if (message.length > 100) result.urgency = 'medium';
    if (result.sentiment === 'angry') result.urgency = 'high';
    if (result.intent === 'urgent') result.urgency = 'critical';

    // AI-enhanced classification for low confidence
    if (result.confidence < 0.6) {
      try {
        const aiResult = await aiService.generateStructuredJson<Partial<IntentResult>>(
          INTENT_CLASSIFIER_PROMPT.replace('{message}', message),
          { model: 'gpt-4o-mini' }
        );
        if (aiResult.intent) result.intent = aiResult.intent as IntentType;
        if (aiResult.sentiment) result.sentiment = aiResult.sentiment as SentimentType;
        if (aiResult.urgency) result.urgency = aiResult.urgency as UrgencyLevel;
        if (aiResult.confidence) result.confidence = aiResult.confidence;
      } catch (error) {
        logger.warn('AI intent classification failed, using rule-based result');
      }
    }

    return result;
  }

  /**
   * Get conversation context for better replies
   */
  async getContext(conversationId: string, limit = 5): Promise<MessageContext> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        conversation: {
          select: {
            contactName: true,
            platform: true,
          },
        },
      },
    });

    const messageHistory = messages.reverse().map((m) => ({
      role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
      content: m.text || '',
      timestamp: m.createdAt,
    }));

    return {
      conversationId,
      messageHistory,
      userProfile: {
        name: messages[0]?.conversation?.contactName,
        isReturning: messages.length > 1,
        totalMessages: messages.length,
        lastInteraction: messages[0]?.createdAt,
      },
    };
  }

  /**
   * Generate intelligent auto-reply using context + intent
   */
  async generateReply(
    message: string,
    context: MessageContext,
    intent: IntentResult
  ): Promise<AutoReplyResult> {
    const result: AutoReplyResult = {
      shouldReply: true,
      useAi: true,
      confidence: intent.confidence,
      escalateToHuman: false,
    };

    // Check rate limit
    if (!this.checkRateLimit(context.conversationId)) {
      logger.warn(`Rate limit exceeded for conversation ${context.conversationId}`);
      return {
        shouldReply: false,
        useAi: false,
        confidence: 0,
        escalateToHuman: true,
      };
    }

    // Escalate to human for certain conditions
    if (intent.sentiment === 'angry' || intent.urgency === 'critical') {
      result.escalateToHuman = true;
      result.replyText = await this.generateEscalationMessage(intent, context);
      return result;
    }

    // Generate AI reply
    try {
      const systemPrompt = AUTO_REPLY_SYSTEM_PROMPT
        .replace('{message}', message)
        .replace('{intent}', intent.intent)
        .replace('{sentiment}', intent.sentiment)
        .replace('{urgency}', intent.urgency);

      const contextHistory = context.messageHistory
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const fullPrompt = contextHistory
        ? `تاريخ المحادثة:\n${contextHistory}\n\n${systemPrompt}`
        : systemPrompt;

      const aiResponse = await aiService.generateText(fullPrompt, {
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 300,
      });

      result.replyText = aiResponse.text;
      result.confidence = 0.9;
    } catch (error) {
      logger.error('AI reply generation failed', error);
      result.replyText = this.getFallbackReply(intent);
      result.confidence = 0.5;
    }

    return result;
  }

  /**
   * Send auto-reply to the appropriate platform
   */
  async sendReply(
    inboxId: string,
    messageId: string,
    replyText: string,
    platform: string
  ): Promise<boolean> {
    const inbox = await prisma.socialInbox.findUnique({
      where: { id: inboxId },
    });

    if (!inbox) {
      logger.error(`Inbox ${inboxId} not found`);
      return false;
    }

    try {
      const originalMessage = await prisma.socialMessage.findUnique({
        where: { id: messageId },
      });

      // Platform-specific sending
      switch (platform) {
        case 'whatsapp': {
          const phone = originalMessage?.phoneNumber || inbox.phoneNumber;
          if (phone) {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            await this.evolutionApi.sendText(
              inbox.name || 'marketron',
              cleanPhone,
              replyText
            );
          }
          break;
        }

        case 'messenger':
        case 'facebook': {
          const fbSenderId = originalMessage?.senderId;
          if (fbSenderId) {
            await metaGraph.sendMessage(fbSenderId, replyText, inbox.platformAccountId || 'me');
          }
          break;
        }

        case 'instagram': {
          const igSenderId = originalMessage?.senderId;
          if (igSenderId) {
            await metaGraph.sendInstagramMessage(igSenderId, replyText);
          }
          break;
        }

        case 'telegram': {
          const chatId = originalMessage?.senderId || originalMessage?.phoneNumber;
          if (chatId) {
            await telegramApi.sendMessage(chatId, replyText);
          }
          break;
        }

        default:
          logger.warn(`Platform ${platform} not yet supported in enhanced auto-reply`);
      }

      // Mark as replied
      await prisma.socialMessage.update({
        where: { id: messageId },
        data: {
          status: 'replied',
          repliedAt: new Date(),
          replyFromAi: true,
          aiReplyText: replyText,
        },
      });

      // Save outbound message
      await prisma.socialMessage.create({
        data: {
          inboxId,
          userId: inbox.userId || '',
          platform: platform,
          direction: 'outbound' as const,
          status: 'sent' as const,
          senderName: 'آلي',
          senderId: '',
          messageText: replyText,
          aiUsed: true,
          sentAt: new Date(),
        },
      });

      logger.info(`Auto-reply sent for message ${messageId} on ${platform}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send auto-reply for ${messageId}`, error);
      return false;
    }
  }

  /**
   * Full auto-reply pipeline
   */
  async processIncomingMessage(
    inboxId: string,
    messageId: string,
    messageText: string,
    conversationId: string,
    platform: string
  ): Promise<AutoReplyResult | null> {
    logger.info(`Processing auto-reply for message ${messageId}`);

    // 1. Analyze intent
    const intent = await this.analyzeIntent(messageText);
    logger.info(`Intent: ${intent.intent}, Sentiment: ${intent.sentiment}, Urgency: ${intent.urgency}`);

    // 2. Get conversation context
    const context = await this.getContext(conversationId);

    // 3. Generate reply
    const reply = await this.generateReply(messageText, context, intent);

    if (!reply.shouldReply) {
      logger.info(`Skipping auto-reply for ${messageId}`);
      return null;
    }

    // 4. Send reply
    if (reply.replyText) {
      const sent = await this.sendReply(inboxId, messageId, reply.replyText, platform);
      if (sent) {
        logger.info(`Auto-reply sent for ${messageId}`);
      }
    }

    // 5. Escalate if needed
    if (reply.escalateToHuman) {
      await this.escalateToHuman(inboxId, conversationId, messageText, intent);
    }

    return reply;
  }

  // ── Private Helpers ──────────────────────────────────

  private detectLanguage(text: string): 'ar' | 'en' | 'fr' | 'tr' | 'other' {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    const frenchChars = (text.match(/[éèêëàâäùûüôöîïç]/gi) || []).length;
    const turkishChars = (text.match(/[çşğüöıİ]/gi) || []).length;

    if (arabicChars > latinChars) return 'ar';
    if (frenchChars > 0) return 'fr';
    if (turkishChars > 0) return 'tr';
    if (latinChars > 0) return 'en';
    return 'other';
  }

  private checkRateLimit(conversationId: string): boolean {
    const now = Date.now();
    const userReplies = this.replyQueue.get(conversationId) || 0;

    if (userReplies >= this.RATE_LIMIT) {
      return false;
    }

    this.replyQueue.set(conversationId, userReplies + 1);

    // Reset after window
    setTimeout(() => {
      const current = this.replyQueue.get(conversationId) || 0;
      if (current > 0) {
        this.replyQueue.set(conversationId, current - 1);
      }
    }, this.RATE_WINDOW);

    return true;
  }

  private async generateEscalationMessage(
    intent: IntentResult,
    context: MessageContext
  ): Promise<string> {
    const name = context.userProfile?.name || 'العزيز';
    const message = intent.sentiment === 'angry'
      ? `عذراً ${name} على الإزعاج. تم تصعيد مشكلتك للفريق المختص وسيتم التواصل معك في أقرب وقت ممكن.`
      : `مرحباً ${name}، شكراً لتواصلك. تم تحويل طلبك للفريق المختص للمتابعة.`;

    return message;
  }

  private getFallbackReply(intent: IntentResult): string {
    const replies: Record<IntentType, string> = {
      sale: 'شكراً لاهتمامك! يمكنك الاطلاع على باقاتنا عبر لوحة التحكم أو التواصل مع فريق المبيعات.',
      support: 'شكراً لتواصلك مع الدعم الفني. نحن نعمل على حل مشكلتك في أسرع وقت.',
      complaint: 'نأسف للإزعاج. تم تسجيل شكواك وسنعمل على حلها فوراً.',
      inquiry: 'شكراً لاستفسارك! يمكنك معرفة المزيد عبر موقعنا أو التواصل مع فريقنا.',
      greeting: 'أهلاً بك في MARKETRON! كيف يمكننا مساعدتك اليوم؟',
      feedback: 'شكراً لمشاركتنا ملاحظاتك! رأيك مهم لتطوير خدماتنا.',
      urgent: 'تم تصعيد طلبك للفريق المختص بشكل عاجل. سيتم التواصل معك قريباً.',
      general: 'شكراً لتواصلك مع MARKETRON. كيف يمكنني مساعدتك؟',
    };
    return replies[intent.intent] || replies.general;
  }

  private async escalateToHuman(
    inboxId: string,
    conversationId: string,
    messageText: string,
    intent: IntentResult
  ): Promise<void> {
    // Create escalation notification
    const inbox = await prisma.socialInbox.findUnique({ where: { id: inboxId } });
    if (inbox) {
      await prisma.notification.create({
        data: {
          userId: inbox.userId,
          title: 'تصعيد تلقائي - محادثة تحتاج تدخل بشري',
          message: `مستخدم في المحادثة ${conversationId}\nالنية: ${intent.intent}\nالمشاعر: ${intent.sentiment}\nالاستعجال: ${intent.urgency}\nالرسالة: ${messageText.slice(0, 200)}`,
          type: 'alert',
          link: `/dashboard/social/inbox/${inboxId}`,
        },
      });
    }

    logger.warn(`Escalated conversation ${conversationId} to human support`);
  }
}

export const autoReplyEngine = new AutoReplyEngine();
