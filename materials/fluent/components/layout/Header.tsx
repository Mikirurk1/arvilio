'use client'
import Link from 'next/link'
import styles from './Header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M3 4h12M3 9h8M3 14h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="14" cy="13.5" r="2.5" fill="#16a97a"/>
          </svg>
        </div>
        <div>
          <div className={styles.logoName}>Fluent</div>
          <div className={styles.logoTag}>English Platform</div>
        </div>
      </div>

      <div className={styles.mid}>
        <div className={styles.searchBox}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#b4b4cc" strokeWidth="1.3"/>
            <path d="M10 10l3 3" stroke="#b4b4cc" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search lessons, words, topics..."/>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.streakBadge}>
          <span>🔥</span>
          <span className={styles.streakNum}>14</span>
          <span className={styles.streakLbl}>day streak</span>
        </div>
        <div className={styles.xpBadge}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polygon points="6.5,1 8.2,5 12.5,5.3 9.5,8 10.5,12.2 6.5,10 2.5,12.2 3.5,8 0.5,5.3 4.8,5" fill="#16a97a"/>
          </svg>
          <span className={styles.xpNum}>2,340</span>
          <span className={styles.xpLbl}>XP</span>
        </div>
        <Link href="/profile" className={styles.avatar}>MK</Link>
      </div>
    </header>
  )
}
