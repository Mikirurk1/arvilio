import './globals.scss';
import { fontClassNames, fontSans } from '@/lib/fonts';

export const metadata = {
  title: 'Arvilio',
  description: 'Ecosystem for language schools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={fontClassNames} suppressHydrationWarning>
      <body className={fontSans.className}>{children}</body>
    </html>
  );
}
