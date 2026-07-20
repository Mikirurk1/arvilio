'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Globe, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyStateCard, Field, SurfaceCard, UpgradePrompt, isFeatureBlockedError } from '../../components/ui';
import { apiClient, ApiError } from '../../lib/api';
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
        setAddError(err instanceof ApiError ? err.message : 'Failed to add domain');
      }
    } finally {
      if (isMounted.current) setAdding(false);
    }
  }, [addHostname]);

  const handleVerify = useCallback(async (id: string) => {
    setVerifying(id);
    try {
      const updated = await apiClient.post<SchoolDomainDto>(`/domains/${id}/verify`);
      if (isMounted.current) {
        setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      }
    } catch (err) {
      if (isMounted.current) {
        const msg = err instanceof ApiError ? err.message : 'Verification failed';
        alert(msg);
      }
    } finally {
      if (isMounted.current) setVerifying(null);
    }
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    if (!confirm('Remove this domain?')) return;
    setRemoving(id);
    try {
      await apiClient.delete(`/domains/${id}`);
      if (isMounted.current) setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch {
      if (isMounted.current) alert('Failed to remove domain');
    } finally {
      if (isMounted.current) setRemoving(null);
    }
  }, []);

  return (
    <div className={styles.root}>
      <SurfaceCard>
        <div className={styles.header}>
          <Globe size={18} aria-hidden />
          <span>Custom Domains</span>
        </div>
        <p className={styles.hint}>
          Add a custom domain for your school (e.g. <code>lessons.yourschool.com</code>).
          After adding, create a DNS <strong>TXT</strong> record with the verification token shown below, then click <strong>Verify</strong>.
        </p>

        {loadState === 'error' && (
          <EmptyStateCard title="Could not load domains" description="Please try again." />
        )}

        {loadState !== 'error' && domains.length === 0 && loadState === 'idle' && (
          <EmptyStateCard
            title="No custom domains yet"
            description="Add a domain below to let students access the platform via your own hostname."
          />
        )}

        {domains.length > 0 && (
          <ul className={styles.list}>
            {domains.map((d) => (
              <li key={d.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.hostname}>{d.hostname}</span>
                  <Badge variant={d.verified ? 'green' : 'amber'}>
                    {d.verified ? 'Verified' : 'Pending'}
                  </Badge>
                  {d.isPrimary && <Badge variant="blue">Primary</Badge>}
                </div>

                {!d.verified && d.verifyToken && (
                  <div className={styles.verifyHint}>
                    Add TXT record:{' '}
                    <code className={styles.token}>soe-verify={d.verifyToken}</code>
                  </div>
                )}

                <div className={styles.rowActions}>
                  {!d.verified && (
                    <Button
                      variant="ghost"
                      startIcon={<RefreshCw size={14} />}
                      loading={verifying === d.id}
                      loadingLabel="Verifying…"
                      disabled={verifying === d.id || removing === d.id}
                      onClick={() => void handleVerify(d.id)}
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    startIcon={<Trash2 size={14} />}
                    loading={removing === d.id}
                    loadingLabel="Removing…"
                    disabled={verifying === d.id || removing === d.id}
                    onClick={() => void handleRemove(d.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.addRow}>
          <Field
            label="Hostname"
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
            loadingLabel="Adding…"
            disabled={adding || !addHostname.trim()}
            onClick={() => void handleAdd()}
          >
            Add domain
          </Button>
        </div>
        {planBlocked && (
          <UpgradePrompt message="Custom domains require the Pro plan." />
        )}
      </SurfaceCard>
    </div>
  );
}
