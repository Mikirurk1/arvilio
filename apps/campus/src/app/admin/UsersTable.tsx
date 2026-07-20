'use client';

import Link from 'next/link';
import { Shield, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';
import type { AdminUserSummaryDto } from '@pkg/types';
import styles from './page.module.scss';

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  super_admin: 'Super admin',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  leaved: 'Left',
  blocked: 'Blocked',
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
  return (
    <section className={styles.listCard} aria-label="Users">
      <header className={styles.cardHeader}>
        <Shield size={16} />
        <div>
          <div className={styles.cardTitle}>Existing accounts</div>
          <div className={styles.cardSub}>
            {canCreateAdmin
              ? 'Showing all non-SUPER_ADMIN accounts. To manage SUPER_ADMIN use the `super-admin` CLI.'
              : 'Showing students, teachers, and admins (admins can be assigned as teachers).'}
          </div>
        </div>
        <Button
          type="button"
          className={styles.refreshBtn}
          onClick={onRefresh}
          loading={isLoading}
          loadingLabel="Refreshing…"
        >
          Refresh
        </Button>
      </header>
      {isLoading ? <div className={styles.muted}>Loading…</div> : null}
      {isError ? (
        <div className={styles.error}>
          Failed to load users: {error ?? 'unknown error'}
        </div>
      ) : null}
      {!isLoading && !isError && users.length === 0 ? (
        <div className={styles.muted}>No accounts yet.</div>
      ) : null}
      {users.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
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
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status_${user.status}`]}`}>
                        {STATUS_LABEL[user.status] ?? user.status}
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
                          aria-label={`Delete ${user.email}`}
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
