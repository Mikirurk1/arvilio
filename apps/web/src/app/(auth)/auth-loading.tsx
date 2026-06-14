import styles from './auth.module.scss';

export function AuthCardFallback() {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading">
      <div className={styles.brand}>
        <div className={styles.skeletonMark} />
      </div>
      <div className={styles.skeletonLine} style={{ width: '48%', height: 28 }} />
      <div className={styles.skeletonLine} style={{ width: '88%', marginTop: 12 }} />
      <div className={styles.skeletonLine} style={{ width: '72%', marginTop: 8 }} />
    </div>
  );
}
