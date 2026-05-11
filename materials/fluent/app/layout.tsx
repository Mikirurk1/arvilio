import type { Metadata } from 'next'
import '../styles/globals.scss'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  title: 'Fluent — English Learning Platform',
  description: 'Learn English effectively with structured lessons, vocabulary, and live sessions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.shell}>
          <Header />
          <div className={styles.body}>
            <Sidebar />
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
