'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { plans } from './landing-data';

export function PricingSection({ locale }: { locale: string }) {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">الأسعار</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">خطط بسيطة وشفافة</h2>
          <p className="text-gray-400 text-lg">بدون رسوم خفية، بدون التزامات طويلة</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                p.highlight
                  ? 'bg-gradient-to-br from-purple-900/60 to-cyan-900/30 border border-purple-500/40 md:scale-105 pricing-card-highlight'
                  : 'bg-[#14102B] border border-purple-900/20 hover:border-purple-500/30'
              }`}>
              {p.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500">{p.badge}</div>
              )}
              <h3 className="text-white font-bold text-xl mb-1">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{p.desc}</p>
              <div className="mb-8">
                <span className={`text-5xl font-black ${p.highlight ? 'text-white' : 'text-gray-200'}`}>{p.price}</span>
                {p.period && <span className="text-gray-400 text-sm mr-2">{p.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-cyan-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a href={`/${locale}/auth/register`}
                className={`block w-full py-3 rounded-xl font-bold text-center transition-all duration-200 ${
                  p.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90'
                    : 'border border-purple-500/40 text-purple-300 hover:bg-purple-900/30'
                }`}>{p.cta}</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
