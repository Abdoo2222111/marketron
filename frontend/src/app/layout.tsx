import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

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
    images: [{ url: '/logo.svg', width: 800, height: 560, alt: 'MARKETRON' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script src="https://puter.com"></script>
      </head>
      <body className="min-h-screen bg-background antialiased noise-overlay">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
