"use client";

import React from "react";
import Link from "next/link";
import { Megaphone, Mail, Phone, MapPin } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

export const Footer: React.FC = () => {
  const { locale, t } = useLocalization();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-600">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-wide">MARKETRON</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {locale === "ar"
                ? "منصة متكاملة للذكاء الاصطناعي والتسويق والأتمتة — إدارة الحملات، تحليل المنافسين، صندوق رسائل موحد، وبوت رد آلي ذكي."
                : "All-in-one AI marketing and automation platform — campaigns, competitor analysis, unified inbox, and intelligent AI reply bot."}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">{locale === "ar" ? "الروابط" : "Links"}</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block hover:text-cyan-400 transition-colors">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
              <Link href="/pricing" className="block hover:text-cyan-400 transition-colors">{locale === "ar" ? "الأسعار" : "Pricing"}</Link>
              <Link href="/blog" className="block hover:text-cyan-400 transition-colors">{locale === "ar" ? "المدونة" : "Blog"}</Link>
              <Link href="/about" className="block hover:text-cyan-400 transition-colors">{locale === "ar" ? "من نحن" : "About"}</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">{locale === "ar" ? "المميزات" : "Features"}</h3>
            <div className="space-y-2 text-sm">
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "إدارة الحملات" : "Campaign Management"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "تحليلات ذكية" : "Smart Analytics"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "محتوى بالذكاء الاصطناعي" : "AI Content"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "تحليل المنافسين" : "Competitor Analysis"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "أبحاث السوق" : "Market Research"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "صندوق الرسائل الموحد" : "Unified Inbox"}</span>
              <span className="block hover:text-cyan-400 transition-colors cursor-pointer">{locale === "ar" ? "بوت الرد الذكي" : "AI Reply Bot"}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">{locale === "ar" ? "تواصل معنا" : "Contact"}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>info@marketron.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>+966 55 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{locale === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MARKETRON. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."} · MARKETING + AUTOMATION
        </div>
      </div>
    </footer>
  );
};