import './globals.scss';
import { AppProviders } from './providers';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import styles from './layout.module.scss';

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
          <div className={styles.shell}>
            <Header />
            <div className={styles.body}>
              <Sidebar />
              <main className={styles.main}>{children}</main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
