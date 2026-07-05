'use client';

import { Star } from 'lucide-react';
import { testimonials } from './landing-data';

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-bold tracking-widest mb-4 block">شهادات العملاء</span>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            ماذا يقول <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">عملاؤنا</span>
          </h2>
          <p className="text-gray-400 text-lg">آلاف المسوقين يثقون في MARKETRON — اكتشف لماذا</p>
        </div>
        <div className="relative">
          <div className="testimonial-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role} &middot; {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0A1A] to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0A1A] to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}
