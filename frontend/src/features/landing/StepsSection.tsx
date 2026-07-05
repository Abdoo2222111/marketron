'use client';

import { motion } from 'framer-motion';
import { steps } from './landing-data';

export function StepsSection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">كيف يعمل</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            ابدأ رحلة <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">النجاح</span> في
            <br />
            <span className="text-white">أربع خطوات بسيطة</span>
          </h2>
          <p className="text-gray-400 text-lg">من التسجيل إلى الانطلاق — كل شيء جاهز في دقائق</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-purple-600/0 via-purple-400/60 to-purple-600/0 shadow-[0_0_8px_rgba(124,58,237,0.3)]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="flex flex-col items-center text-center group">
                  <div className="relative mb-7">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600/40 to-cyan-500/20 border border-purple-500/40 group-hover:border-purple-400/60 shadow-[0_0_30px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-all duration-500">
                      <Icon size={30} className="text-purple-300 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-white text-sm font-bold flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform duration-300">{i + 1}</span>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[220px] sm:max-w-[220px] group-hover:text-gray-300 transition-colors duration-300">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
