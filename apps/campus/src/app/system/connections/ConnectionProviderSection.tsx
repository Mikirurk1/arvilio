'use client';

import type { ReactNode } from 'react';
import { Button } from '../../../components/ui';
import { useCampusT } from '../../../lib/cms';
import type { VerifyPlatformConnectionResultDto } from '@pkg/types';
import type { ConnectionProviderMeta } from './connection-provider-meta';
import { DocsLink } from './connection-ui';
import styles from './ConnectionsPanel.module.scss';

type Props = {
  meta: ConnectionProviderMeta;
  verifying: boolean;
  verifyResult: VerifyPlatformConnectionResultDto | null | undefined;
  onVerify: () => void;
  children: ReactNode;
};

export function ConnectionProviderSection({
  meta,
  verifying,
  verifyResult,
  onVerify,
  children,
}: Props) {
  const t = useCampusT();

  return (
    <section className={styles.section} aria-labelledby={`connection-${meta.id}-title`}>
      <header className={styles.sectionHead}>
        <div className={styles.sectionTitleBlock}>
          <h3 className={styles.sectionTitle} id={`connection-${meta.id}-title`}>
            {t(meta.titleKey)}
          </h3>
          <p className={styles.sectionBlurb}>{t(meta.blurbKey)}</p>
        </div>
        <div className={styles.sectionActions}>
          <DocsLink href={meta.docsUrl} label={meta.docsLabel} />
          <Button
            type="button"
            className={styles.verifyBtn}
            loading={verifying}
            loadingLabel="…"
            onClick={onVerify}
          >
            {t('system.connections.verify')}
          </Button>
        </div>
      </header>

      <div className={styles.sectionBody}>
        <div className={styles.fields}>{children}</div>
        {verifyResult ? (
          <p
            className={verifyResult.ok ? styles.verifyBannerOk : styles.verifyBannerFail}
            role="status"
          >
            {verifyResult.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
