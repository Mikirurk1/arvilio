'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, X } from 'lucide-react';
import { BodyPortal, Button, Field } from '../../components/ui';
import { useProfileStore } from '../../stores/profile-store';
import { toast } from '../../features/notifications';
import styles from './page.module.scss';

export function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const changePassword = useProfileStore((s) => s.changePassword);
  const passwordMutating = useProfileStore((s) => s.passwordMutating);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !passwordMutating) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, passwordMutating]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!currentPassword.trim()) { setFormError('Enter your current password.'); return; }
    if (newPassword.length < 8) { setFormError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setFormError('New passwords do not match.'); return; }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated', 'Use your new password next time you sign in.');
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  return (
    <BodyPortal>
      <div className={styles.passwordModalBackdrop} onClick={() => { if (!passwordMutating) onClose(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="change-password-title" className={styles.passwordModal} onClick={(event) => event.stopPropagation()}>
          <header className={styles.passwordModalHead}>
            <div className={styles.passwordModalHeadText}>
              <span className={styles.passwordModalBadge}><KeyRound size={14} />Security</span>
              <h3 id="change-password-title" className={styles.passwordModalTitle}>Change password</h3>
              <p className={styles.passwordModalText}>Enter your current password, then choose a new one (at least 8 characters).</p>
            </div>
            <Button type="button" variant="ghost" className={styles.passwordModalClose} aria-label="Close password modal" disabled={passwordMutating} onClick={onClose}>
              <X size={16} aria-hidden />
            </Button>
          </header>
          <form className={styles.passwordModalForm} onSubmit={(event) => void handleSubmit(event)} noValidate>
            {formError ? <p className={styles.passwordModalError}>{formError}</p> : null}
            <div className={styles.passwordModalFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="current-password">Current password</label>
                <Field id="current-password" type="password" className={styles.input} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={passwordMutating} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-password">New password</label>
                <Field id="new-password" type="password" className={styles.input} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={passwordMutating} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="confirm-password">Confirm new password</label>
                <Field id="confirm-password" type="password" className={styles.input} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={passwordMutating} />
              </div>
            </div>
            <footer className={styles.passwordModalActions}>
              <Button type="button" variant="ghost" className={styles.passwordModalCancel} disabled={passwordMutating} onClick={onClose}>Cancel</Button>
              <Button type="submit" className={styles.passwordModalSubmit} loading={passwordMutating} loadingLabel="Saving…">Update password</Button>
            </footer>
          </form>
        </div>
      </div>
    </BodyPortal>
  );
}
