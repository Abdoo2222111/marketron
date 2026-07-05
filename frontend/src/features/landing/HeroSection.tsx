'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, ChevronDown } from 'lucide-react';
import { LOGO_URL, heroStats } from './landing-data';

export function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 hero-grid hero-grid-cyan">
      <div className="gradient-orb w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/20" style={{ top: '0%', left: '0%', animationDelay: '0s' }} />
      <div className="hidden sm:block gradient-orb w-[400px] h-[400px] bg-cyan-500/15" style={{ top: '50%', right: '0%', animationDelay: '-3s' }} />
      <div className="hidden sm:block gradient-orb w-[300px] h-[300px] bg-pink-500/10" style={{ top: '30%', left: '50%', animationDelay: '-6s' }} />
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="flex justify-center mb-10">
            <motion.img src={LOGO_URL} alt="MARKETRON" className="h-24 sm:h-32 w-auto opacity-95 drop-shadow-[0_0_20px_rgba(124,58,237,0.4)]" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} />
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-purple-200 text-sm font-bold mb-8 animate-fade-in-down shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            منصة الذكاء الاصطناعي للتسويق الرقمي
          </div>
          <h1 className="text-[2.5rem] xs:text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-8 animate-fade-in-up [text-shadow:_0_0_30px_rgba(6,182,212,0.3)]">
            حملاتك الإعلانية
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
              بعقل ذكي يفهمك
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            أدر حملاتك على Meta وGoogle وTikTok من مكان واحد،
            <br />مع وكيل ذكاء اصطناعي يرد على عملائك 24/7 ويولّد محتوى تسويقي احترافي
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <a href={`/${locale}/auth/register`}
              className="group px-8 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.8)] hover:scale-105 transition-all duration-300 flex items-center gap-3">
              ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </a>
            <a href="#features"
              className="px-8 py-4 rounded-2xl font-semibold text-purple-300 text-lg border border-purple-500/40 bg-purple-900/20 hover:bg-purple-900/40 hover:border-purple-400 transition-all duration-300 flex items-center gap-3">
              <Play className="w-5 h-5 text-cyan-400" /> شاهد كيف يعمل
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up animation-delay-600">
            {heroStats.map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{num}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-600">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
