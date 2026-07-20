'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyStateCard, Field, SurfaceCard, UpgradePrompt, isFeatureBlockedError } from '../../components/ui';
import { apiClient, ApiError } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import styles from './DomainsPanel.module.scss';

interface SchoolDomainDto {
  id: string;
  hostname: string;
  kind: 'SUBDOMAIN' | 'CUSTOM';
  verified: boolean;
  verifyToken: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export function DomainsPanel() {
  const t = useCampusT();
  const [domains, setDomains] = useState<SchoolDomainDto[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('loading');
  const [addHostname, setAddHostname] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [planBlocked, setPlanBlocked] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const list = await apiClient.get<SchoolDomainDto[]>('/domains');
      if (isMounted.current) { setDomains(list); setLoadState('idle'); }
    } catch {
      if (isMounted.current) setLoadState('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAdd = useCallback(async () => {
    const hostname = addHostname.trim();
    if (!hostname) return;
    setAdding(true);
    setAddError(null);
    setPlanBlocked(false);
    try {
      const created = await apiClient.post<SchoolDomainDto>('/domains', { hostname });
      if (isMounted.current) {
        setDomains((prev) => [...prev, created]);
        setAddHostname('');
      }
    } catch (err) {
      if (!isMounted.current) return;
      if (isFeatureBlockedError(err)) {
        setPlanBlocked(true);
      } else {
        setAddError(err instanceof ApiError ? err.message : t('system.domains.error.add'));
      }
    } finally {
      if (isMounted.current) setAdding(false);
    }
  }, [addHostname, t]);

  const handleVerify = useCallback(async (id: string) => {
    setVerifying(id);
    try {
      const updated = await apiClient.post<SchoolDomainDto>(`/domains/${id}/verify`);
      if (isMounted.current) {
        setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      }
    } catch (err) {
      if (isMounted.current) {
        const msg = err instanceof ApiError ? err.message : t('system.domains.error.verify');
        alert(msg);
      }
    } finally {
      if (isMounted.current) setVerifying(null);
    }
  }, [t]);

  const handleRemove = useCallback(async (id: string) => {
    if (!confirm(t('system.domains.confirmRemove'))) return;
    setRemoving(id);
    try {
      await apiClient.delete(`/domains/${id}`);
      if (isMounted.current) setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch {
      if (isMounted.current) alert(t('system.domains.error.remove'));
    } finally {
      if (isMounted.current) setRemoving(null);
    }
  }, [t]);

  return (
    <div className={styles.root}>
      <SurfaceCard>
        <div className={styles.header}>
          <Globe size={18} aria-hidden />
          <span>{t('system.domains.title')}</span>
        </div>
        <p className={styles.hint}>{t('system.domains.hint')}</p>

        {loadState === 'error' && (
          <EmptyStateCard
            title={t('system.domains.loadError.title')}
            description={t('system.domains.loadError.desc')}
          />
        )}

        {loadState !== 'error' && domains.length === 0 && loadState === 'idle' && (
          <EmptyStateCard
            title={t('system.domains.empty.title')}
            description={t('system.domains.empty.desc')}
          />
        )}

        {domains.length > 0 && (
          <ul className={styles.list}>
            {domains.map((d) => (
              <li key={d.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.hostname}>{d.hostname}</span>
                  <Badge variant={d.verified ? 'green' : 'amber'}>
                    {d.verified ? t('system.domains.badge.verified') : t('system.domains.badge.pending')}
                  </Badge>
                  {d.isPrimary && <Badge variant="blue">{t('system.domains.badge.primary')}</Badge>}
                </div>

                {!d.verified && d.verifyToken && (
                  <div className={styles.verifyHint}>
                    {t('system.domains.txtRecordPrefix')}{' '}
                    <code className={styles.token}>soe-verify={d.verifyToken}</code>
                  </div>
                )}

                <div className={styles.rowActions}>
                  {!d.verified && (
                    <Button
                      variant="ghost"
                      startIcon={<RefreshCw size={14} />}
                      loading={verifying === d.id}
                      loadingLabel={t('system.domains.verifying')}
                      disabled={verifying === d.id || removing === d.id}
                      onClick={() => void handleVerify(d.id)}
                    >
                      {t('system.domains.verify')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    startIcon={<Trash2 size={14} />}
                    loading={removing === d.id}
                    loadingLabel={t('system.domains.removing')}
                    disabled={verifying === d.id || removing === d.id}
                    onClick={() => void handleRemove(d.id)}
                  >
                    {t('system.domains.remove')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.addRow}>
          <Field
            label={t('system.domains.hostname')}
            value={addHostname}
            onChange={(e) => setAddHostname(e.target.value)}
            placeholder="lessons.yourschool.com"
            onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); }}
            error={addError ?? undefined}
          />
          <Button
            type="button"
            startIcon={<Plus size={14} />}
            loading={adding}
            loadingLabel={t('system.domains.adding')}
            disabled={adding || !addHostname.trim()}
            onClick={() => void handleAdd()}
          >
            {t('system.domains.add')}
          </Button>
        </div>
        {planBlocked && (
          <UpgradePrompt message={t('system.domains.planBlocked')} />
        )}
      </SurfaceCard>
    </div>
  );
}
