import { Lora, Outfit } from 'next/font/google';

export const fontSans = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
});

export const fontDisplay = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

export const fontClassNames = `${fontSans.variable} ${fontDisplay.variable}`;
