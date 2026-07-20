'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ProviderSetupGuide as Guide } from '../word-dictionary-setup-guides';
import { useCampusT } from '../../../lib/cms';
import styles from '../WordDictionaryPanel.module.scss';

export function ProviderSetupGuide({ guide }: { guide: Guide }) {
  const t = useCampusT();

  return (
    <aside className={styles.setupGuide} aria-label={t('system.dictionary.setupGuide.aria')}>
      <p className={styles.setupGuideSummary}>{guide.summary}</p>
      <p className={styles.setupGuidePricing}>
        <strong>{t('system.dictionary.setupGuide.pricing')}</strong> {guide.pricing}
      </p>
      {guide.envVars?.length ? (
        <div className={styles.setupGuideEnv}>
          <span className={styles.setupGuideEnvTitle}>{t('system.dictionary.setupGuide.envVars')}</span>
          <ul className={styles.setupGuideEnvList}>
            {guide.envVars.map((row) => (
              <li key={row.name}>
                <code>{row.name}</code> — {row.note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ol className={styles.setupGuideSteps}>
        {guide.steps.map((step, index) => (
          <li key={index}>
            {step.text}
            {step.links?.length ? (
              <span className={styles.setupGuideLinks}>
                {step.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.providerLink}
                  >
                    {link.label}
                    <ExternalLink size={12} aria-hidden />
                  </Link>
                ))}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </aside>
  );
}
