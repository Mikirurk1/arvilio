'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, X } from 'lucide-react';
import { BodyPortal, Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();
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
    if (!currentPassword.trim()) { setFormError(t('profile.password.error.current')); return; }
    if (newPassword.length < 8) { setFormError(t('profile.password.error.length')); return; }
    if (newPassword !== confirmPassword) { setFormError(t('profile.password.error.match')); return; }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success(t('profile.password.toastTitle'), t('profile.password.toastBody'));
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('profile.password.error.failed'));
    }
  };

  return (
    <BodyPortal>
      <div className={styles.passwordModalBackdrop} onClick={() => { if (!passwordMutating) onClose(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="change-password-title" className={styles.passwordModal} onClick={(event) => event.stopPropagation()}>
          <header className={styles.passwordModalHead}>
            <div className={styles.passwordModalHeadText}>
              <span className={styles.passwordModalBadge}><KeyRound size={14} />{t('profile.password.security')}</span>
              <h3 id="change-password-title" className={styles.passwordModalTitle}>{t('profile.password.title')}</h3>
              <p className={styles.passwordModalText}>{t('profile.password.hint')}</p>
            </div>
            <Button type="button" variant="ghost" className={styles.passwordModalClose} aria-label={t('profile.password.closeAria')} disabled={passwordMutating} onClick={onClose}>
              <X size={16} aria-hidden />
            </Button>
          </header>
          <form className={styles.passwordModalForm} onSubmit={(event) => void handleSubmit(event)} noValidate>
            {formError ? <p className={styles.passwordModalError}>{formError}</p> : null}
            <div className={styles.passwordModalFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="current-password">{t('profile.password.current')}</label>
                <Field id="current-password" type="password" className={styles.input} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={passwordMutating} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="new-password">{t('profile.password.new')}</label>
                <Field id="new-password" type="password" className={styles.input} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={passwordMutating} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="confirm-password">{t('profile.password.confirm')}</label>
                <Field id="confirm-password" type="password" className={styles.input} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={passwordMutating} />
              </div>
            </div>
            <footer className={styles.passwordModalActions}>
              <Button type="button" variant="ghost" className={styles.passwordModalCancel} disabled={passwordMutating} onClick={onClose}>{t('profile.password.cancel')}</Button>
              <Button type="submit" className={styles.passwordModalSubmit} loading={passwordMutating} loadingLabel={t('profile.saving')}>{t('profile.password.update')}</Button>
            </footer>
          </form>
        </div>
      </div>
    </BodyPortal>
  );
}
