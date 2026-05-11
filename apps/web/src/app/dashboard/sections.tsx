'use client';

import Link from 'next/link';
import { Button, SurfaceCard } from '../../components/ui';
import styles from './page.module.scss';

export function WordOfDayCard() {
  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>Word of the day</div>
      <div className={styles.wordBig}>Eloquent</div>
      <div className={styles.wordPhonetic}>/ˈɛl.ə.kwənt/ · adjective</div>
      <div className={styles.wordDef}>
        Fluent and persuasive in speaking or writing; able to express ideas clearly and effectively.
      </div>
      <div className={styles.wordExample}>
        &quot;She delivered an eloquent speech that moved the entire audience to applause.&quot;
      </div>
      <div className={styles.wordActions}>
        <Button className={styles.btn}>Save</Button>
        <Link href="/practice/vocabulary" className={`${styles.btn} ${styles.btnGreen}`}>
          Practice now
        </Link>
      </div>
    </SurfaceCard>
  );
}

export function StreakCalendarCard({ calDays, doneDays }: { calDays: number[]; doneDays: number[] }) {
  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>April 2026</div>
      <div className={styles.calSub}>14-day streak this month</div>
      <div className={styles.calGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.calDayName}>
            {day}
          </div>
        ))}
        <div className={styles.calEmpty} />
        <div className={styles.calEmpty} />
        {calDays.map((day) => (
          <div key={day} className={`${styles.calDay} ${doneDays.includes(day) ? styles.calDone : ''} ${day === 20 ? styles.calToday : ''}`}>
            {day}
          </div>
        ))}
      </div>
      <Link href="/calendar" className={styles.calLink}>
        View full calendar →
      </Link>
    </SurfaceCard>
  );
}
