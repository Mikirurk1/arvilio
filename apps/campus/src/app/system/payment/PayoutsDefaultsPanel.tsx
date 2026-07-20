'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_STAFF_PAYOUT_DEFAULTS, type StaffPayoutDefaultsDto } from '@pkg/types';
import { TabPanelCard } from '../../../components/ui';
import { StaffPayoutDefaultsPanel } from '../../../features/staff-payout';
import { useCampusT } from '../../../lib/cms';
import { useFinanceStore } from '../../../stores/finance-store';

export function PayoutsDefaultsPanel() {
  const t = useCampusT();
  const defaultsSlice = useFinanceStore((s) => s.defaults);
  const fetchDefaults = useFinanceStore((s) => s.fetchDefaults);
  const updateDefaults = useFinanceStore((s) => s.updateDefaults);
  const [draft, setDraft] = useState<StaffPayoutDefaultsDto>(DEFAULT_STAFF_PAYOUT_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void fetchDefaults()
      .then(setDraft)
      .catch(() => undefined);
  }, [fetchDefaults]);

  useEffect(() => {
    if (defaultsSlice.status === 'success' && defaultsSlice.data) {
      setDraft(defaultsSlice.data);
    }
  }, [defaultsSlice]);

  const onSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await updateDefaults(draft);
      setDraft(saved);
      setFeedback(t('system.payouts.saved'));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('system.payouts.error.save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <TabPanelCard>
      <StaffPayoutDefaultsPanel
        draft={draft}
        onChange={setDraft}
        loading={defaultsSlice.status === 'loading' && !defaultsSlice.data}
        saving={saving || defaultsSlice.status === 'loading'}
        feedback={feedback}
        error={defaultsSlice.status === 'error' ? defaultsSlice.error : null}
        onSave={() => void onSave()}
      />
    </TabPanelCard>
  );
}
