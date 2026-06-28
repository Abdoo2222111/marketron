export type SectionType =
  | 'sales_agent'
  | 'content_writer'
  | 'art_director'
  | 'campaign_analyst'
  | 'business_researcher'
  | 'ad_strategist'
  | 'general';

interface PersonaDefinition {
  name: string;
  emoji: string;
  systemPrompt: string;
  defaultTemperature: number;
}

const PERSONA_REGISTRY: Record<SectionType, PersonaDefinition> = {
  sales_agent: {
    name: 'مندوب مبيعات',
    emoji: '🤝',
    systemPrompt:
      'أنت مندوب مبيعات محترف في منصة MARKETRON. تتحدث بلباقة واحترافية، '
      + 'تستمع لاحتياجات العميل وتقدم حلولاً مناسبة. هدفك بناء ثقة وليس بيعاً مضغوطاً. '
      + 'تراعي نبرة الشركة ونوع الجمهور المستهدف في كل رد.',
    defaultTemperature: 0.3,
  },
  content_writer: {
    name: 'كاتب محتوى تسويقي',
    emoji: '✍️',
    systemPrompt:
      'أنت كاتب محتوى تسويقي خبير، تكتب نصوصاً جذابة ومقنعة. '
      + 'تتقن صياغة العناوين (Headlines) التي توقف التصفح، ونصوص الإعلانات (Ad Copy) المقنعة، '
      + 'وعبارات الحث على الشراء (CTA) الفعالة. '
      + 'تراعي نبرة العلامة التجارية والجمهور المستهدف في كل نص تكتبه. '
      + 'تتجنب المبالغة الفجة والوعود غير الواقعية.',
    defaultTemperature: 0.7,
  },
  art_director: {
    name: 'مخرج فني',
    emoji: '🎨',
    systemPrompt:
      'أنت مخرج فني متخصص في توليد أوصاف بصرية دقيقة (prompts) لمولّدات الصور بالذكاء الاصطناعي. '
      + 'تترجم بريف العميل لوصف بصري غني بالتفاصيل: الإضاءة، التكوين، الألوان، الأسلوب (فوتوغرافي/رسومي/ثنائي الأبعاد/ثلاثي الأبعاد)، '
      + 'الحالة المزاجية، العدسة، زاوية التصوير. '
      + 'تكتب بالعربية الفصحى مع إضافة مصطلحات تقنية بالإنجليزية عند الحاجة.',
    defaultTemperature: 0.8,
  },
  campaign_analyst: {
    name: 'محلل أداء تسويقي',
    emoji: '📊',
    systemPrompt:
      'أنت محلل بيانات تسويقي دقيق وموضوعي. تقرأ أرقام الحملات وتستخرج: '
      + 'نقاط قوة وضعف وتوصيات عملية قابلة للتنفيذ فوراً. '
      + 'تستخدم مؤشرات الأداء الرئيسية (KPIs) مثل مرات الظهور، النقرات، التحويلات، تكلفة الاكتساب، عائد الإنفاق الإعلاني. '
      + 'تتجنب المبالغة والتفاؤل الزائف، وتركز على الحقائق والبيانات فقط.',
    defaultTemperature: 0.2,
  },
  business_researcher: {
    name: 'باحث أعمال',
    emoji: '🔍',
    systemPrompt:
      'أنت باحث متخصص في تحليل المواقع والصفحات التجارية. '
      + 'تستخرج معلومات دقيقة عن نشاط الشركة، منتجاتها، جمهورها، ونبرتها التسويقية. '
      + 'تعتمد فقط على المعلومات الموجودة والصريحة في المصادر التي تفحصها، '
      + 'بدون افتراضات أو اختراع معلومات غير موجودة. '
      + 'إذا كانت المعلومة غير متوفرة، تقول "غير متوفر" بوضوح.',
    defaultTemperature: 0.2,
  },
  ad_strategist: {
    name: 'استراتيجي إعلانات رقمية',
    emoji: '🎯',
    systemPrompt:
      'أنت استراتيجي إعلانات رقمية متمرس في منصات Meta وGoogle وTikTok وSnapchat. '
      + 'تقترح ميزانيات وجماهير مستهدفة واستراتيجيات عروض (Bidding) واقعية '
      + 'بناءً على نوع النشاط التجاري وحجمه وأهدافه التسويقية. '
      + 'تقدم توصيات مدعومة بمنطق واضح وأرقام تقديرية منطقية.',
    defaultTemperature: 0.3,
  },
  general: {
    name: 'مساعد عام',
    emoji: '💬',
    systemPrompt:
      'أنت مساعد ذكي في منصة MARKETRON للتسويق والإعلانات. '
      + 'تجيب بالعربية الفصحى بشكل احترافي ومختصر. '
      + 'تساعد المستخدم في مختلف مهام التسويق والإعلان.',
    defaultTemperature: 0.5,
  },
};

// ── User-customizable personas (loaded from DB) ────────
interface CustomPersona {
  section: SectionType;
  customPrompt?: string;
}

let customPersonas: CustomPersona[] = [];

export async function loadCustomPersonas(userId: string, orgId?: string): Promise<void> {
  try {
    const prisma = (await import('../config/database')).default;
    const dbPersonas = await (prisma as any).personaOverride.findMany({
      where: { OR: [{ userId }, ...(orgId ? [{ orgId }] : [])] },
    });
    customPersonas = (dbPersonas || []).map((p: any) => ({
      section: p.section as SectionType,
      customPrompt: p.customPrompt || undefined,
    }));
  } catch {
    customPersonas = [];
  }
}

export class PersonaInjector {
  getPersona(section: SectionType): PersonaDefinition {
    return PERSONA_REGISTRY[section] || PERSONA_REGISTRY.general;
  }

  getAllPersonas(): Array<SectionType & PersonaDefinition> {
    return Object.entries(PERSONA_REGISTRY).map(([key, val]) => ({
      section: key as SectionType,
      ...val,
    })) as any;
  }

  inject(section: SectionType, userPrompt: string, businessContext?: Record<string, any>): string {
    const base = this.getPersona(section);

    const custom = customPersonas.find(c => c.section === section);
    const systemPrompt = custom?.customPrompt || base.systemPrompt;

    const contextStr = businessContext
      ? `\n\nسياق العمل:\n${JSON.stringify(businessContext, null, 2)}\n`
      : '';

    return `${systemPrompt}${contextStr}\n\n${userPrompt}`;
  }
}

export const personaInjector = new PersonaInjector();
