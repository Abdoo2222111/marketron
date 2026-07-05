'use client';

import { motion } from 'framer-motion';
import { features } from './landing-data';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">المميزات</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            كل ما تحتاجه في
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> مكان واحد</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">منصة متكاملة تجمع بين الذكاء الاصطناعي وأدوات التسويق الرقمي</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-[#14102B] to-[#1A1238] border border-purple-900/20 hover:border-purple-500/40 hover:-translate-y-3 transition-all duration-500 cursor-pointer hover:shadow-[0_0_50px_rgba(124,58,237,0.25)] before:absolute before:inset-0 before:rounded-3xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 before:bg-gradient-to-br before:from-purple-600/10 before:to-transparent">
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform duration-300`}
                    style={{ background: `linear-gradient(135deg, ${f.color}50, ${f.color}20)` }}>
                    <Icon size={26} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
