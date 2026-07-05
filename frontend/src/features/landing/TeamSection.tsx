'use client';

import { motion } from 'framer-motion';

const team = [
  { name: 'أحمد عبدالله', role: 'المؤسس والرئيس التنفيذي', desc: 'خبرة ١٠+ سنوات في التسويق الرقمي والذكاء الاصطناعي' },
  { name: 'سارة العنزي', role: 'مديرة التطوير التقني', desc: 'مهندسة برمجيات سابقة في كبرى شركات التقنية' },
  { name: 'فيصل المطيري', role: 'رئيس قسم المنتجات', desc: 'متخصص في تجربة المستخدم وتصميم المنتجات الرقمية' },
  { name: 'نورة الدوسري', role: 'مديرة التسويق والنمو', desc: 'خبرة في بناء العلامات التجارية واستراتيجيات النمو' },
];

export function TeamSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">فريق العمل</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            خبراء في <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">التسويق والتقنية</span>
          </h2>
          <p className="text-gray-400 text-lg">ناس شغوفين يشتغلون عشانك 24/7</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#14102B] to-[#1A1238] border border-purple-900/20 hover:border-purple-500/30 transition-all duration-500 text-center hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform duration-300">
                {m.name[0]}
              </div>
              <h3 className="text-white font-bold text-base mb-1">{m.name}</h3>
              <p className="text-purple-300 text-xs font-semibold mb-2">{m.role}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
