'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export function CTASection({ locale }: { locale: string }) {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-[#0B0A1A] to-cyan-900/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-purple-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.02] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 text-sm font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            ابدأ رحلتك الآن
          </div>
          <h2 className="text-5xl sm:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">جاهز لتطوير أعمالك</span>
            <span className="block text-white mt-2">باستخدام MARKETRON؟</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">ابدأ مجاناً اليوم — بدون بطاقة ائتمان، بدون التزامات. وانضم لأكثر من 500 مسوّق يستخدمون المنصة</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a href={`/${locale}/auth/register`}
              className="group px-12 py-5 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:shadow-[0_0_80px_rgba(124,58,237,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-3">
              ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </a>
            <a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer"
              className="px-10 py-5 rounded-2xl font-semibold text-emerald-300 text-lg border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-900/40 hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <MessageSquare size={20} /> تواصل واتساب
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
