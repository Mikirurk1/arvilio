'use client';

import Link from 'next/link';
import { Shield, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import type { AdminUserSummaryDto } from '@pkg/types';
import styles from './page.module.scss';

const ROLE_LABEL: Record<string, string> = {
  student: 'admin.role.student',
  teacher: 'admin.role.teacher',
  admin: 'admin.role.admin',
  super_admin: 'admin.role.superAdmin',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'admin.status.active',
  paused: 'admin.status.paused',
  leaved: 'admin.status.leaved',
  blocked: 'admin.status.blocked',
};

const TEACHING_ROLES = new Set<AdminUserSummaryDto['role']>(['teacher', 'admin', 'super_admin']);

interface Props {
  users: AdminUserSummaryDto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null | undefined;
  canCreateAdmin: boolean;
  mutating: boolean;
  onDelete: (id: string, label: string, role: string) => void;
  onRefresh: () => void;
}

export function UsersTable({ users, isLoading, isError, error, canCreateAdmin, mutating, onDelete, onRefresh }: Props) {
  const t = useCampusT();
  return (
    <section className={styles.listCard} aria-label={t('admin.table.aria')}>
      <header className={styles.cardHeader}>
        <Shield size={16} />
        <div>
          <div className={styles.cardTitle}>{t('admin.table.title')}</div>
          <div className={styles.cardSub}>
            {canCreateAdmin
              ? t('admin.table.subtitle.super')
              : t('admin.table.subtitle.default')}
          </div>
        </div>
        <Button
          type="button"
          className={styles.refreshBtn}
          onClick={onRefresh}
          loading={isLoading}
          loadingLabel={t('admin.table.refreshing')}
        >
          {t('admin.table.refresh')}
        </Button>
      </header>
      {isLoading ? <div className={styles.muted}>{t('admin.table.loading')}</div> : null}
      {isError ? (
        <div className={styles.error}>
          {t('admin.table.loadFailed', { error: error ?? 'unknown error' })}
        </div>
      ) : null}
      {!isLoading && !isError && users.length === 0 ? (
        <div className={styles.muted}>{t('admin.table.noAccounts')}</div>
      ) : null}
      {users.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('admin.table.col.email')}</th>
                <th>{t('admin.table.col.name')}</th>
                <th>{t('admin.table.col.role')}</th>
                <th>{t('admin.table.col.status')}</th>
                <th>{t('admin.table.col.created')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const canDelete =
                  user.role !== 'super_admin' &&
                  (canCreateAdmin || user.role === 'student');
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      {TEACHING_ROLES.has(user.role) ? (
                        <Link href={`/staff/${user.id}`} className={styles.staffLink}>
                          {user.displayName}
                        </Link>
                      ) : (
                        user.displayName
                      )}
                    </td>
                    <td>
                      <span className={`${styles.role} ${styles[`role_${user.role}`]}`}>
                        {t(ROLE_LABEL[user.role] ?? 'admin.role.student')}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status_${user.status}`]}`}>
                        {t(STATUS_LABEL[user.status] ?? 'admin.status.active')}
                      </span>
                    </td>
                    <td className={styles.created}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.rowActions}>
                      {canDelete ? (
                        <Button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => onDelete(user.id, user.email, user.role)}
                          disabled={mutating}
                          aria-label={t('admin.table.deleteAria', { email: user.email })}
                        >
                          <Trash2 size={14} />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
