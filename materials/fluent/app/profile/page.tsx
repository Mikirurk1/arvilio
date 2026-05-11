'use client'
import { useState } from 'react'
import styles from './page.module.scss'

type Tab = 'profile' | 'notifications' | 'appearance' | 'account'

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: 'Mykola Kovalenko',
    email: 'mykola@example.com',
    phone: '+380 67 123 4567',
    timezone: 'Europe/Kiev',
    nativeLanguage: 'Ukrainian',
    targetLevel: 'C1',
    weeklyGoal: '5',
    bio: 'Full-stack developer learning English for professional growth and international opportunities.',
  })
  const [notifications, setNotifications] = useState({
    lessonReminder: true,
    streakAlert: true,
    weeklyReport: true,
    newVocab: false,
    teacherMessages: true,
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'account', label: 'Account' },
  ]

  const achievements = [
    { icon: '🔥', label: '14-Day Streak', unlocked: true },
    { icon: '📚', label: '500 Words', unlocked: true },
    { icon: '🎯', label: 'First Quiz', unlocked: true },
    { icon: '💬', label: 'Speaking Pro', unlocked: true },
    { icon: '🏆', label: '100% Quiz', unlocked: false },
    { icon: '⭐', label: 'Level 20', unlocked: false },
    { icon: '🌍', label: '30-Day Streak', unlocked: false },
    { icon: '📖', label: '1000 Words', unlocked: false },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile &amp; Settings</h1>
        <p className={styles.pageSub}>Manage your account and preferences</p>
      </div>

      {/* Profile hero */}
      <div className={styles.profileHero}>
        <div className={styles.avatarBig}>MK</div>
        <div className={styles.heroInfo}>
          <div className={styles.heroName}>{form.name}</div>
          <div className={styles.heroMeta}>B2 · Level 18 · 14-day streak 🔥</div>
          <div className={styles.heroBadges}>
            <span className={styles.badge}>Upper-Intermediate</span>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>Active learner</span>
            <span className={`${styles.badge} ${styles.badgeAmber}`}>2,340 XP</span>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>847</span>
            <span className={styles.heroStatLbl}>Words</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>38</span>
            <span className={styles.heroStatLbl}>Lessons</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>14</span>
            <span className={styles.heroStatLbl}>Streak</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className={styles.achievementsRow}>
        {achievements.map(a => (
          <div key={a.label} className={`${styles.achievement} ${a.unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}>
            <div className={styles.achievementIcon}>{a.icon}</div>
            <div className={styles.achievementLabel}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        {tabs.map(t => (
          <button key={t.id} className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tab === 'profile' && (
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full name</label>
                <input className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Timezone</label>
                <select className={styles.input} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                  <option value="Europe/Kiev">Europe/Kyiv (UTC+3)</option>
                  <option value="Europe/London">Europe/London (UTC+1)</option>
                  <option value="America/New_York">America/New York (UTC-4)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Native language</label>
                <select className={styles.input} value={form.nativeLanguage} onChange={e => setForm(f => ({ ...f, nativeLanguage: e.target.value }))}>
                  <option>Ukrainian</option>
                  <option>Russian</option>
                  <option>Polish</option>
                  <option>German</option>
                  <option>French</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Target level</label>
                <select className={styles.input} value={form.targetLevel} onChange={e => setForm(f => ({ ...f, targetLevel: e.target.value }))}>
                  {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Weekly lesson goal</label>
                <select className={styles.input} value={form.weeklyGoal} onChange={e => setForm(f => ({ ...f, weeklyGoal: e.target.value }))}>
                  {['1','2','3','4','5','6','7'].map(n => <option key={n}>{n} lesson{n !== '1' ? 's' : ''}/week</option>)}
                </select>
              </div>
            </div>
            <div className={styles.fieldGroup} style={{ marginTop: 16 }}>
              <label className={styles.label}>Bio</label>
              <textarea className={`${styles.input} ${styles.textarea}`} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} />
            </div>
            <div className={styles.formFooter}>
              {saved && <span className={styles.savedMsg}>✓ Changes saved</span>}
              <button className={styles.saveBtn} onClick={handleSave}>Save changes</button>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className={styles.formCard}>
            {[
              { key: 'lessonReminder', label: 'Lesson reminders', desc: 'Get notified 30 minutes before each lesson' },
              { key: 'streakAlert', label: 'Streak alerts', desc: 'Reminder to keep your daily streak alive' },
              { key: 'weeklyReport', label: 'Weekly report', desc: 'Summary of your progress every Monday' },
              { key: 'newVocab', label: 'New vocabulary', desc: 'Daily word of the day notification' },
              { key: 'teacherMessages', label: 'Teacher messages', desc: 'Notifications when your teacher sends a message' },
            ].map(({ key, label, desc }) => (
              <div key={key} className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <div className={styles.toggleLabel}>{label}</div>
                  <div className={styles.toggleDesc}>{desc}</div>
                </div>
                <button
                  className={`${styles.toggle} ${notifications[key as keyof typeof notifications] ? styles.toggleOn : ''}`}
                  onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof notifications] }))}
                >
                  <div className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'appearance' && (
          <div className={styles.formCard}>
            <div className={styles.sectionLabel}>Theme</div>
            <div className={styles.themeGrid}>
              {(['light', 'dark', 'auto'] as const).map(t => (
                <button key={t} className={`${styles.themeCard} ${theme === t ? styles.themeActive : ''}`} onClick={() => setTheme(t)}>
                  <div className={`${styles.themePreview} ${styles[`theme${t.charAt(0).toUpperCase() + t.slice(1)}`]}`}>
                    <div className={styles.themeBar} />
                    <div className={styles.themeContent} />
                  </div>
                  <span className={styles.themeLabel}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              ))}
            </div>
            <div className={styles.sectionLabel} style={{ marginTop: 24 }}>Font size</div>
            <div className={styles.fontSizeRow}>
              {['Small', 'Medium', 'Large'].map((s, i) => (
                <button key={s} className={`${styles.fontBtn} ${i === 1 ? styles.fontActive : ''}`}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {tab === 'account' && (
          <div className={styles.formCard}>
            <div className={styles.dangerSection}>
              <div className={styles.sectionLabel}>Account actions</div>
              <div className={styles.accountItem}>
                <div>
                  <div className={styles.accountItemTitle}>Change password</div>
                  <div className={styles.accountItemDesc}>Update your login password</div>
                </div>
                <button className={styles.actionBtn}>Change</button>
              </div>
              <div className={styles.accountItem}>
                <div>
                  <div className={styles.accountItemTitle}>Export my data</div>
                  <div className={styles.accountItemDesc}>Download your learning history and vocabulary</div>
                </div>
                <button className={styles.actionBtn}>Export</button>
              </div>
              <div className={`${styles.accountItem} ${styles.dangerItem}`}>
                <div>
                  <div className={styles.accountItemTitle} style={{ color: 'var(--rose)' }}>Delete account</div>
                  <div className={styles.accountItemDesc}>Permanently delete all your data. This cannot be undone.</div>
                </div>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
