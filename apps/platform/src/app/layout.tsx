import './globals.scss';
import { ConsoleShell } from '../components/ConsoleShell';

export const metadata = {
  title: 'Arvilio Platform Console',
  description: 'Platform operator console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConsoleShell>{children}</ConsoleShell>
      </body>
    </html>
  );
}
