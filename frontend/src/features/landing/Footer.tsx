'use client';

import { LOGO_URL } from './landing-data';

export function Footer() {
  return (
    <footer className="border-t border-purple-900/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="MARKETRON" className="h-14 w-auto drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
              <span className="text-white font-black text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">MARKETRON</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              منصة متكاملة للذكاء الاصطناعي والتسويق الرقمي — تساعدك على إدارة حملاتك وتنمية أعمالك بكفاءة أعلى
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">المنصة</h4>
            <ul className="space-y-2">
              {['المميزات', 'الأسعار', 'الحملات', 'الوكيل الذكي'].map(l => (
                <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-purple-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-2">
              <li><a href="https://wa.me/201011273472" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-emerald-400 transition-colors">واتساب: 01011273472</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-purple-900/20 pt-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-600 text-sm">© 2026 MARKETRON. جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-600 text-sm hover:text-purple-400 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="text-gray-600 text-sm hover:text-purple-400 transition-colors">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
