import styles from './loading.module.scss';

export function StudentPageSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading student page">
      <div className={styles.heroRow}>
        <div className={styles.avatar} />
        <div className={styles.heroText}>
          <div className={styles.title} />
          <div className={styles.subtitle} />
        </div>
      </div>
      <div className={styles.tabs} />
    </div>
  );
}
