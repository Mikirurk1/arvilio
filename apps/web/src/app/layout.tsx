import './globals.scss';
import { AppProviders } from './providers';
import AppShell from '../components/layout/AppShell';

export const metadata = {
  title: 'SoEnglish',
  description: 'SSR-first English learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
