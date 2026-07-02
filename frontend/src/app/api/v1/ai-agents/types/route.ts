import { NextResponse } from 'next/server';

const AGENT_TYPES = [
  { value: 'campaign_agent', label: 'وكيل الحملات', description: 'إدارة وتحسين الحملات الإعلانية', icon: 'Megaphone' },
  { value: 'content_agent', label: 'وكيل المحتوى', description: 'إنشاء المحتوى الإعلاني والنصوص', icon: 'FileText' },
  { value: 'analytics_agent', label: 'وكيل التحليلات', description: 'تحليل بيانات الحملات', icon: 'BarChart3' },
  { value: 'market_research_agent', label: 'وكيل أبحاث السوق', description: 'تحليل السوق والمنافسين', icon: 'Search' },
  { value: 'social_agent', label: 'وكيل التواصل', description: 'إدارة صندوق الرسائل الموحد', icon: 'MessageCircle' },
  { value: 'whatsapp_agent', label: 'وكيل واتساب', description: 'إرسال واستقبال رسائل واتساب', icon: 'Phone' },
  { value: 'support_agent', label: 'وكيل الدعم', description: 'خدمة العملاء والدعم الفني', icon: 'Headphones' },
  { value: 'general_agent', label: 'وكيل عام', description: 'مساعد ذكي متعدد الاستخدامات', icon: 'Bot' },
];

export async function GET() {
  return NextResponse.json({ data: AGENT_TYPES });
}
