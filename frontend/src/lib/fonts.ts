import { Cairo, Inter, Space_Grotesk } from 'next/font/google';

export const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: false,
  weight: ['300', '400', '500', '600', '700'],
});
