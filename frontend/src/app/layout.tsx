import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { cairo, inter, spaceGrotesk } from '@/lib/fonts';

export const metadata: Metadata = {
  metadataBase: new URL('https://marketron.ai'),
  title: 'MARKETRON - التسويق والأتمتة الذكية',
  description: 'MARKETRON - منصة متكاملة للذكاء الاصطناعي والتسويق والأتمتة | إدارة الحملات الإعلانية، تحليل المنافسين، صندوق رسائل موحد، وبوت رد آلي ذكي',
  keywords: ['ماركترون', 'MARKETRON', 'تسويق', 'أتمتة', 'ذكاء اصطناعي', 'إعلانات', 'حملات', 'فيسبوك', 'انستجرام', 'تيك توك', 'سناب شات'],
  authors: [{ name: 'MARKETRON' }],
  openGraph: {
    title: 'MARKETRON - التسويق والأتمتة الذكية',
    description: 'MARKETING + AUTOMATION - منصة متكاملة للذكاء الاصطناعي والتسويق',
    type: 'website',
    locale: 'ar_SA',
    images: [{ url: '/logo.png', width: 800, height: 560, alt: 'MARKETRON' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preconnect" href="https://js.puter.com" />
        <script src="https://js.puter.com/v2/" async></script>
      </head>
      <body className="min-h-screen bg-background antialiased noise-overlay" style={{ fontFamily: 'var(--font-cairo), var(--font-inter), sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
