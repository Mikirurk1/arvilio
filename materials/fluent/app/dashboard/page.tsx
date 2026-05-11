import Link from 'next/link';
import styles from './page.module.scss';

async function getLessons() {
  const res = await fetch('/data/lessons.json', { cache: 'no-store' }).catch(
    () => null,
  );
  if (!res || !res.ok) return [];
  const payload: unknown = await res.json();
  return Array.isArray(payload) ? payload : [];
}

const lessonTypeLabel: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  speaking: 'Speaking',
  listening: 'Listening',
};

const lessonTypeClass: Record<string, string> = {
  grammar: 'tagGrammar',
  vocabulary: 'tagVocab',
  speaking: 'tagSpeaking',
  listening: 'tagListening',
};

export default async function DashboardPage() {
  const lessons = await getLessons();
  const todayLessons = lessons.slice(0, 4);
  const vocabWords = [
    {
      word: 'Eloquent',
      pos: 'adjective',
      def: 'Fluent and persuasive in speech',
      status: 'new',
    },
    {
      word: 'Leverage',
      pos: 'verb/noun',
      def: 'Use to maximum advantage',
      status: 'learning',
    },
    {
      word: 'Concise',
      pos: 'adjective',
      def: 'Clear and brief',
      status: 'known',
    },
    {
      word: 'Ambiguous',
      pos: 'adjective',
      def: 'Open to interpretation',
      status: 'learning',
    },
    {
      word: 'Coherent',
      pos: 'adjective',
      def: 'Logical and consistent',
      status: 'new',
    },
  ];

  const goals = [
    { text: 'Complete 1 grammar lesson', done: true, xp: 30 },
    { text: 'Review 20 flashcards', done: true, xp: 20 },
    { text: 'Practice speaking 10 min', done: false, xp: 40 },
    { text: 'Earn 100 XP total today', done: false, xp: 50 },
  ];

  const calDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const doneDays = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Good morning, <em>Mykola</em> 👋
        </h1>
        <p className={styles.pageSub}>
          Monday, April 20 · You're on a 14-day streak — keep it up!
        </p>
      </div>

      {/* Hero banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroLabel}>Continue where you left off</div>
          <div className={styles.heroTitle}>Business Vocabulary — Unit 3</div>
          <div className={styles.heroSub}>
            Finance &amp; investment terms · 15 words remaining
          </div>
          <div className={styles.heroProgress}>
            <div className={styles.heroBar}>
              <div className={styles.heroBarFill} />
            </div>
            <span className={styles.heroPct}>62% complete</span>
          </div>
        </div>
        <Link href="/vocabulary" className={styles.heroBtn}>
          Continue →
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.amber}`}>📚</div>
          <div className={styles.statLabel}>Words learned</div>
          <div className={styles.statValue}>847</div>
          <div className={styles.statSub}>+12 this week</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.green}`}>⏱️</div>
          <div className={styles.statLabel}>Study time this week</div>
          <div className={styles.statValue}>3.2h</div>
          <div className={styles.statSub}>+31 min vs last week</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.blue}`}>✅</div>
          <div className={styles.statLabel}>Lessons completed</div>
          <div className={styles.statValue}>38</div>
          <div className={styles.statSub}>5 this week</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className={styles.twoCol}>
        <div className={styles.leftCol}>
          {/* Lessons */}
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>Today&apos;s lessons</div>
            <Link href="/quiz" className={styles.seeAll}>
              See all →
            </Link>
          </div>
          <div className={styles.lessonList}>
            {todayLessons.map((lesson: any, i: number) => (
              <div
                key={lesson.id}
                className={`${styles.lessonCard} ${lesson.locked ? styles.locked : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span
                  className={`${styles.tag} ${styles[lessonTypeClass[lesson.type]]}`}
                >
                  {lessonTypeLabel[lesson.type]}
                </span>
                <div className={styles.lcTitle}>{lesson.title}</div>
                <div className={styles.lcDesc}>{lesson.description}</div>
                <div className={styles.lcFooter}>
                  <div className={styles.lcMeta}>
                    <span className={styles.lcMetaItem}>
                      ⏱ {lesson.duration} min
                    </span>
                    <span className={styles.lcMetaItem}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <span className={styles.lcXp}>+{lesson.xp} XP</span>
                </div>
                {lesson.locked && (
                  <div className={styles.lockOverlay}>🔒 Locked</div>
                )}
              </div>
            ))}
          </div>

          {/* Vocab row */}
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>Review words</div>
            <Link href="/vocabulary" className={styles.seeAll}>
              All words →
            </Link>
          </div>
          <div className={styles.vocabRow}>
            {vocabWords.map((w) => (
              <div key={w.word} className={styles.vocabCard}>
                <div className={styles.vocabWord}>{w.word}</div>
                <div className={styles.vocabPos}>{w.pos}</div>
                <div className={styles.vocabDef}>{w.def}</div>
                <div className={styles.vocabStatus}>
                  <div className={`${styles.vocabDot} ${styles[w.status]}`} />
                  <span className={styles.vocabStatusLbl}>
                    {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.rightCol}>
          {/* Goals */}
          <div className={styles.panel}>
            <div className={styles.sectionTitle}>Daily goals</div>
            <div className={styles.goalsSubtitle}>2 of 4 completed</div>
            {goals.map((g, i) => (
              <div key={i} className={styles.goalItem}>
                <div
                  className={`${styles.goalCheck} ${g.done ? styles.done : ''}`}
                >
                  {g.done && <div className={styles.checkmark} />}
                </div>
                <span
                  className={`${styles.goalText} ${g.done ? styles.goalDone : ''}`}
                >
                  {g.text}
                </span>
                <span className={styles.goalReward}>+{g.xp} XP</span>
              </div>
            ))}
          </div>

          {/* Word of the day */}
          <div className={styles.panel}>
            <div className={styles.sectionTitle}>Word of the day</div>
            <div className={styles.wordBig}>Eloquent</div>
            <div className={styles.wordPhonetic}>/ˈɛl.ə.kwənt/ · adjective</div>
            <div className={styles.wordDef}>
              Fluent and persuasive in speaking or writing; able to express
              ideas clearly and effectively.
            </div>
            <div className={styles.wordExample}>
              &quot;She delivered an eloquent speech that moved the entire
              audience to applause.&quot;
            </div>
            <div className={styles.wordActions}>
              <button className={styles.btn}>Save</button>
              <Link
                href="/vocabulary"
                className={`${styles.btn} ${styles.btnGreen}`}
              >
                Practice now
              </Link>
            </div>
          </div>

          {/* Calendar mini */}
          <div className={styles.panel}>
            <div className={styles.sectionTitle}>April 2026</div>
            <div className={styles.calSub}>14-day streak this month</div>
            <div className={styles.calGrid}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className={styles.calDayName}>
                  {d}
                </div>
              ))}
              <div className={styles.calEmpty} />
              <div className={styles.calEmpty} />
              {calDays.map((d) => (
                <div
                  key={d}
                  className={`${styles.calDay}
                  ${doneDays.includes(d) ? styles.calDone : ''}
                  ${d === 20 ? styles.calToday : ''}
                `}
                >
                  {d}
                </div>
              ))}
            </div>
            <Link href="/calendar" className={styles.calLink}>
              View full calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
