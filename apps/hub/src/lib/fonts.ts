import { Fraunces, Source_Sans_3 } from 'next/font/google';

/** Display (headings) — self-hosted via next/font (avoids render-blocking Google CSS). */
export const fontDisplay = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-www-display',
  display: 'swap',
});

/** Body — includes Cyrillic for UK locale. */
export const fontSans = Source_Sans_3({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-www-sans',
  display: 'swap',
});

export const fontClassNames = `${fontDisplay.variable} ${fontSans.variable}`;
