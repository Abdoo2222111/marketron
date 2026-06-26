// ============================================================
// OpenAI Integration — Now delegates to Multi-AI Service
// للحفاظ على التوافق مع الكود القديم
// ============================================================

import { aiService } from './aiService';
import logger from '../utils/logger';

/**
 * Generate text using AI (defaults to OpenAI, falls back to any configured provider).
 */
export async function generateAI(prompt: string): Promise<string> {
  try {
    const result = await aiService.generateText(prompt, {
      systemPrompt: `أنت مساعد متخصص في التسويق الإلكتروني وتحليل الأسواق لمنصة MARKETRON.
أنت تجيب باللغة العربية الفصحى.
ردودك دقيقة ومفيدة ومبنية على أحدث ممارسات التسويق الرقمي.
عند طلب بيانات منظمة، أعدها بتنسيق JSON صالح.`,
    });
    logger.info(`AI response generated (${result.text.length} chars) via ${result.provider}/${result.model}`);
    return result.text;
  } catch (error: any) {
    logger.error('AI generation failed', { error: error.message });
    if (prompt.includes('JSON') || prompt.includes('مصفوفة')) {
      return JSON.stringify({ error: 'تعذر الاتصال بخدمة الذكاء الاصطناعي حالياً', fallback: true });
    }
    throw new Error(`AI service unavailable: ${error.message}`);
  }
}

/**
 * Generate structured JSON output from AI.
 */
export async function generateStructuredAI<T>(prompt: string): Promise<T> {
  return aiService.generateStructuredJson<T>(prompt);
}
