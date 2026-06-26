/**
 * Arabic text processing utilities
 * Normalization, stop words, hashtag generation, and emoji suggestions
 */

// Arabic stop words common in marketing context
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'إلى', 'عن', 'على', 'مع', 'كان', 'هذا', 'هذه', 'ذلك',
  'تلك', 'هو', 'هي', 'هم', 'هن', 'و', 'ف', 'ثم', 'أو', 'لا',
  'لم', 'لن', 'إن', 'أن', 'قد', 'ما', 'ماذا', 'كيف', 'لماذا', 'أين',
  'هل', 'أ', 'ب', 'ل', 'ك', 'ال', 'التي', 'الذي', 'الذين', 'اللواتي',
  'اللذان', 'اللتان', 'الذين', 'اللواتي', 'الواتي', 'اللائي',
  'كل', 'بعض', 'جميع', 'نحو', 'حول', 'بين', 'أثناء', 'بعد', 'قبل',
  'فوق', 'تحت', 'دون', 'خلال', 'حتى', 'غير', 'سوى', 'مثل', 'مثلاً',
  'هناك', 'هنا', 'ثمة', 'أيضاً', 'أيضا', 'كذلك', 'أي', 'أية', 'أيها',
  'أيتها', 'نحن', 'أنتم', 'أنت', 'اللهم', 'إذ', 'إذا', 'حين', 'عندما',
  'حيث', 'أما', 'إما', 'سوف', 'سي', 'س', 'لقد', 'لعل', 'ربما', 'ليت',
]);

// Normalization mappings for Arabic characters
const ARABIC_NORMALIZATION: Record<string, string> = {
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ة': 'ه',
  'ى': 'ي',
  'ؤ': 'و',
  'ئ': 'ي',
  'ا': 'ا',
  'ب': 'ب',
  'ت': 'ت',
  'ث': 'ث',
  'ج': 'ج',
  'ح': 'ح',
  'خ': 'خ',
  'د': 'د',
  'ذ': 'ذ',
  'ر': 'ر',
  'ز': 'ز',
  'س': 'س',
  'ش': 'ش',
  'ص': 'ص',
  'ض': 'ض',
  'ط': 'ط',
  'ظ': 'ظ',
  'ع': 'ع',
  'غ': 'غ',
  'ف': 'ف',
  'ق': 'ق',
  'ك': 'ك',
  'ل': 'ل',
  'م': 'م',
  'ن': 'ن',
  'ه': 'ه',
  'و': 'و',
  'ي': 'ي',
};

// Emoji mapping for Arabic marketing content
const EMOJI_MAP: Record<string, string[]> = {
  'success': ['✅', '🎯', '🏆', '🌟', '✨'],
  'offer': ['🎉', '🔥', '💥', '⚡', '🎁'],
  'new': ['🆕', '✨', '🌟', '💫', '🚀'],
  'love': ['❤️', '💙', '💚', '💜', '🧡'],
  'growth': ['📈', '🚀', '💪', '🔥', '⬆️'],
  'ideas': ['💡', '💭', '✨', '🌟', '🎯'],
  'team': ['🤝', '👥', '💪', '👏', '🙌'],
  'time': ['⏰', '⌛', '📅', '⏳', '🔔'],
  'money': ['💰', '💵', '💎', '💳', '🤑'],
  'shopping': ['🛍️', '🛒', '🎪', '🏪', '🎀'],
  'celebration': ['🎊', '🎉', '🥳', '🎈', '🎇'],
  'social': ['📱', '💻', '🌐', '📲', '💬'],
  'target': ['🎯', '📍', '🎪', '🎯', '🏹'],
  'star': ['⭐', '🌟', '✨', '💫', '🏅'],
  'fire': ['🔥', '💥', '⚡', '🌟', '💯'],
};

/**
 * Normalize Arabic text by simplifying characters
 */
export function normalizeArabic(text: string): string {
  let normalized = '';
  for (const char of text) {
    normalized += ARABIC_NORMALIZATION[char] || char;
  }
  // Remove diacritics (tashkeel)
  normalized = normalized.replace(/[ًٌٍَُِّّْ]/g, '');
  return normalized;
}

/**
 * Remove Arabic stop words from text
 */
export function removeStopWords(text: string): string {
  const words = text.split(/\s+/);
  return words
    .filter(word => !ARABIC_STOP_WORDS.has(word))
    .join(' ');
}

/**
 * Generate Arabic hashtags from text
 */
export function generateArabicHashtags(text: string, count: number = 5): string[] {
  // Remove punctuation and normalize
  const clean = text
    .replace(/[،\.\?\!\:\;\,\-\(\)\[\]\{\}]/g, '')
    .replace(/[؟!]/g, '');

  const words = clean.split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !ARABIC_STOP_WORDS.has(w));

  // Get unique words, prioritize longer/more meaningful ones
  const unique = [...new Set(words)];
  const scored = unique.map(word => ({
    word,
    score: word.length * 2 + (word.includes('ة') ? 1 : 0) + (word.includes('ي') ? 1 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, count)
    .map(item => `#${item.word}`);
}

/**
 * Generate bilingual hashtags (Arabic + English translation)
 */
export function generateBilingualHashtags(
  arabicText: string,
  englishKeywords: string[],
  count: number = 10
): string[] {
  const arabicHashtags = generateArabicHashtags(arabicText, Math.ceil(count / 2));
  const englishHashtags = englishKeywords
    .filter(k => k.length > 1)
    .slice(0, Math.floor(count / 2))
    .map(k => `#${k.replace(/\s+/g, '')}`);

  return [...arabicHashtags, ...englishHashtags].slice(0, count);
}

/**
 * Get random emoji from a category
 */
export function getEmoji(category: string): string {
  const emojis = EMOJI_MAP[category];
  if (!emojis || emojis.length === 0) return '✨';
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Suggest emojis based on content type
 */
export function suggestEmojis(contentType: string, count: number = 3): string[] {
  const suggestions: string[] = [];

  const typeMap: Record<string, string[]> = {
    post: ['social', 'love', 'ideas'],
    ad: ['offer', 'fire', 'target'],
    article: ['ideas', 'growth', 'star'],
    story: ['social', 'celebration', 'time'],
    description: ['shopping', 'money', 'star'],
    reel: ['fire', 'celebration', 'social'],
    offer: ['offer', 'money', 'fire'],
    announcement: ['new', 'celebration', 'star'],
    greeting: ['love', 'celebration', 'star'],
  };

  const categories = typeMap[contentType] || ['star', 'social', 'fire'];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    suggestions.push(getEmoji(category));
  }

  return suggestions;
}

/**
 * Simplify Arabic text for AI processing (remove diacritics, normalize)
 */
export function simplifyForAI(text: string): string {
  return normalizeArabic(text)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
}

/**
 * Calculate text length in Arabic-friendly way
 * (Arabic characters are wider, so we adjust)
 */
export function getArabicTextLength(text: string): { chars: number; words: number; adjustedLength: string } {
  const chars = text.length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  // Arabic chars take ~1.5x the visual space
  const adjusted = Math.ceil(chars + arabicChars * 0.5);

  let adjustedLength: string;
  if (adjusted < 100) adjustedLength = 'short';
  else if (adjusted < 300) adjustedLength = 'medium';
  else adjustedLength = 'long';

  return { chars, words, adjustedLength };
}

export default {
  normalizeArabic,
  removeStopWords,
  generateArabicHashtags,
  generateBilingualHashtags,
  getEmoji,
  suggestEmojis,
  simplifyForAI,
  containsArabic,
  getArabicTextLength,
};
