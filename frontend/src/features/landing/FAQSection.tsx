'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'هل أحتاج لبطاقة ائتمان للتسجيل؟', a: 'لا مطلقاً. الخطط التجريبية مجانية بالكامل بدون بطاقة ائتمان. جرب المنصة وأقرر بعدها.' },
  { q: 'كم منصة إعلانية يمكنني ربطها؟', a: 'في الخطة التجريبية يمكنك ربط منصة واحدة. الخطة الاحترافية تدعم حتى ٣ منصات، والمؤسسي غير محدود.' },
  { q: 'هل تدعمون اللغة العربية بشكل كامل؟', a: 'نعم، المنصة بالعربية بالكامل — واجهة، تقارير، توليد محتوى AI، ودعم فني. اللغة الإنجليزية والفرنسية والتركية مدعومة أيضاً.' },
  { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، بدون رسوم إلغاء ولا التزامات. يمكنك إلغاء أو تغيير خطتك في أي وقت من لوحة الإعدادات.' },
  { q: 'كيف يعمل وكيل الذكاء الاصطناعي؟', a: 'الوكيل الذكي يتعلم من نشاطك التجاري ويرد على عملائك تلقائياً عبر واتساب وماسنجر. يمكنك مراجعة وتعديل أي رد قبل إرساله.' },
  { q: 'هل بياناتي آمنة؟', a: 'نعم، كل البيانات مشفرة ونستخدم HTTPS في جميع الاتصالات. لا نشارك بياناتك مع أي طرف ثالث. تقاريرك وحملاتك خاصة بك بالكامل.' },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">الأسئلة الشائعة</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            إجابات لكل <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">استفساراتك</span>
          </h2>
          <p className="text-gray-400 text-lg">كل ما تحتاج معرفته قبل البدء مع MARKETRON</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`rounded-2xl border transition-all duration-300 cursor-pointer ${
              openIndex === i
                ? 'border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-cyan-900/10'
                : 'border-purple-900/20 bg-[#14102B] hover:border-purple-500/30'
            }`} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <div className="flex items-center justify-between p-5">
                <h3 className="text-white font-semibold text-sm sm:text-base">{faq.q}</h3>
                <ChevronDown size={18} className={`text-purple-400 transition-transform duration-300 flex-shrink-0 ${
                  openIndex === i ? 'rotate-180' : ''
                }`} />
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
