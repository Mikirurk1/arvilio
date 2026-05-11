'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.scss'

const navItems = [
  {
    section: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/vocabulary', label: 'Vocabulary', icon: 'book', badge: '3' },
      { href: '/quiz', label: 'Quiz & Speaking', icon: 'quiz', badge: '4', badgeColor: 'green' },
    ]
  },
  {
    section: 'Schedule',
    items: [
      { href: '/calendar', label: 'Calendar', icon: 'calendar' },
    ]
  },
  {
    section: 'Account',
    items: [
      { href: '/profile', label: 'Profile & Settings', icon: 'profile' },
    ]
  }
]

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 18 18" fill="none">
      <path d="M9 3C7 3 5 3.5 4 4.5V14.5C5 13.5 7 13 9 13s4 .5 5 1.5V4.5C13 3.5 11 3 9 3z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 3v10" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="9" cy="13" r="0.7" fill="currentColor"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="3.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2.5 7.5h13M6 2v3M12 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 15c0-2.76 2.69-5 6-5s6 2.24 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navItems.map(({ section, items }) => (
          <div key={section} className={styles.section}>
            <div className={styles.sectionTitle}>{section}</div>
            {items.map(({ href, label, icon, badge, badgeColor }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.item} ${active ? styles.active : ''}`}
                >
                  <span className={styles.icon}>{icons[icon]}</span>
                  <span>{label}</span>
                  {badge && (
                    <span className={`${styles.badge} ${badgeColor === 'green' ? styles.badgeGreen : ''}`}>
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.levelCard}>
          <div className={styles.levelTop}>
            <span className={styles.levelName}>Level 18 · B2</span>
            <span className={styles.levelPct}>68%</span>
          </div>
          <div className={styles.levelBar}>
            <div className={styles.levelFill} style={{ width: '68%' }} />
          </div>
          <div className={styles.levelXp}>2,340 / 3,500 XP to Level 19</div>
        </div>
      </div>
    </aside>
  )
}
