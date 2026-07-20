'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StudentGroupDto, StudentSummaryBackendDto } from '@pkg/types';
import { Plus, Users } from 'lucide-react';
import { Badge, Button, SurfaceCard, EmptyStateCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { isAdminOrSuper } from '../../lib/roles';
import { useActiveUser } from '../../lib/active-user';
import { useStudentsStore } from '../../stores/students-store';
import {
  ASSIGNABLE_TEACHERS,
  CREATE_STUDENT_GROUP,
  DELETE_STUDENT_GROUP,
  STUDENT_GROUPS,
  UPDATE_STUDENT_GROUP,
} from '../../graphql/operations';
import { graphqlRequest } from '../../lib/graphql-client';
import { ApiError } from '../../lib/api';
import {
  billingModeLabel,
  buildGroupPayload,
  emptyDraft,
  type GroupDraft,
  validateDraft,
} from './group-utils';
import { GroupEditorCard } from './GroupEditorCard';
import styles from './page.module.scss';

export function StudentsGroupsPanel() {
  const t = useCampusT();
  const activeUser = useActiveUser();
  const studentsSlice = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const [groups, setGroups] = useState<StudentGroupDto[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; displayName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<GroupDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberKey, setAddMemberKey] = useState(0);

  const isAdmin = isAdminOrSuper(activeUser.role);
  const allStudents = studentsSlice.data ?? [];

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await graphqlRequest<{ studentGroups: StudentGroupDto[] }>(STUDENT_GROUPS);
      setGroups(data.studentGroups);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('students.groups.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAdmin) return;
    void fetchStudents();
    void loadGroups();
    void (async () => {
      try {
        const data = await graphqlRequest<{
          assignableTeachers: Array<{ id: string; displayName: string }>;
        }>(ASSIGNABLE_TEACHERS);
        setTeachers(data.assignableTeachers);
      } catch {
        setTeachers([]);
      }
    })();
  }, [isAdmin, fetchStudents, loadGroups]);

  const payerCandidates = useMemo(
    () =>
      draft.memberUserIds
        .map((id) => allStudents.find((student) => student.id === id))
        .filter((student): student is StudentSummaryBackendDto => Boolean(student)),
    [allStudents, draft.memberUserIds],
  );

  const draftMembers = useMemo(
    () =>
      draft.memberUserIds.map((id) => {
        const student = allStudents.find((row) => row.id === id);
        return {
          id,
          displayName: student?.displayName ?? t('students.groups.unknownStudent'),
          email: student?.email ?? '',
        };
      }),
    [allStudents, draft.memberUserIds, t],
  );

  const startCreate = () => {
    setSaveError(null);
    setShowAddMember(false);
    setEditingId('new');
    setDraft(emptyDraft());
  };

  const startEdit = (group: StudentGroupDto) => {
    setSaveError(null);
    setShowAddMember(false);
    setEditingId(group.id);
    setDraft({
      name: group.name,
      teacherId: group.teacherId ?? '',
      memberUserIds: group.members.map((m) => m.userId),
      groupBillingMode: group.groupBillingMode,
      groupPriceMinor: group.groupPriceMinor ?? 0,
      groupCurrency: group.groupCurrency ?? 'UAH',
      groupSplitMode: group.groupSplitMode ?? 'equal_split',
      groupPayerUserId: group.groupPayerUserId ?? '',
    });
  };

  const closeEditor = () => {
    setEditingId(null);
    setSaveError(null);
    setShowAddMember(false);
  };

  const onSave = async () => {
    const validationError = validateDraft(draft, t);
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = buildGroupPayload(draft);
      if (editingId === 'new') {
        await graphqlRequest(CREATE_STUDENT_GROUP, { input: payload });
      } else if (editingId) {
        await graphqlRequest(UPDATE_STUDENT_GROUP, { id: editingId, input: payload });
      }
      closeEditor();
      await loadGroups();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('students.groups.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm(t('students.groups.deleteConfirm'))) return;
    try {
      await graphqlRequest(DELETE_STUDENT_GROUP, { id });
      if (editingId === id) closeEditor();
      await loadGroups();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('students.groups.deleteFailed'));
    }
  };

  const addMember = (student: StudentSummaryBackendDto) => {
    if (draft.memberUserIds.includes(student.id)) return;
    setDraft((prev) => ({
      ...prev,
      memberUserIds: [...prev.memberUserIds, student.id],
    }));
    setSaveError(null);
    setShowAddMember(false);
    setAddMemberKey((key) => key + 1);
  };

  const removeMember = (studentId: string) => {
    setDraft((prev) => ({
      ...prev,
      memberUserIds: prev.memberUserIds.filter((id) => id !== studentId),
      groupPayerUserId: prev.groupPayerUserId === studentId ? '' : prev.groupPayerUserId,
    }));
    setSaveError(null);
  };

  if (!isAdmin) {
    return (
      <EmptyStateCard
        title={t('students.groups.adminOnlyTitle')}
        description={t('students.groups.adminOnlyDesc')}
      />
    );
  }

  return (
    <div className={styles.groupsPanel}>
      <div className={styles.groupsToolbar}>
        <div className={styles.groupsToolbarCopy}>
          <p className={styles.groupsIntro}>{t('students.groups.intro')}</p>
          {!loading ? (
            <p className={styles.groupsMeta}>
              {groups.length === 1
                ? t('students.groups.countOne')
                : t('students.groups.countMany', { count: groups.length })}
            </p>
          ) : null}
        </div>
        <Button type="button" startIcon={<Plus size={16} />} onClick={startCreate}>
          {t('students.groups.new')}
        </Button>
      </div>

      {loadError ? <p className={styles.groupsLoadError}>{loadError}</p> : null}
      {loading ? <p className={styles.loadingHint}>{t('students.groups.loading')}</p> : null}

      {editingId ? (
        <GroupEditorCard
          editingId={editingId}
          draft={draft}
          setDraft={setDraft}
          teachers={teachers}
          payerCandidates={payerCandidates}
          draftMembers={draftMembers}
          showAddMember={showAddMember}
          setShowAddMember={setShowAddMember}
          addMemberKey={addMemberKey}
          saveError={saveError}
          setSaveError={setSaveError}
          saving={saving}
          onSave={() => void onSave()}
          onClose={closeEditor}
          onAddMember={addMember}
          onRemoveMember={removeMember}
        />
      ) : null}

      {!editingId && groups.length === 0 && !loading ? (
        <EmptyStateCard
          title={t('students.groups.emptyTitle')}
          description={t('students.groups.emptyDesc')}
        />
      ) : null}

      {groups.length > 0 ? (
        <div className={styles.groupsGrid}>
          {groups.map((group) => (
            <SurfaceCard key={group.id} className={styles.groupCard}>
              <div className={styles.groupCardHead}>
                <div className={styles.groupCardIcon} aria-hidden>
                  <Users size={16} />
                </div>
                <div className={styles.groupCardHeadCopy}>
                  <h3 className={styles.groupCardTitle}>{group.name}</h3>
                  <p className={styles.groupCardMeta}>
                    {group.teacherName ? group.teacherName : t('students.groups.noTeacher')}
                  </p>
                </div>
                <Badge variant="neutral">{billingModeLabel(group.groupBillingMode, t)}</Badge>
              </div>

              <div className={styles.groupCardStats}>
                <span>{t('students.groups.membersCount', { count: group.members.length })}</span>
                {group.groupBillingMode === 'fixed_total' && group.groupPriceMinor != null ? (
                  <span>
                    {(group.groupPriceMinor / 100).toFixed(2)} {group.groupCurrency ?? 'UAH'}
                    {t('students.groups.perLesson')}
                  </span>
                ) : (
                  <span>{t('students.groups.creditPerMember')}</span>
                )}
              </div>

              {group.members.length > 0 ? (
                <p className={styles.groupCardMembersPreview}>
                  {group.members
                    .slice(0, 4)
                    .map((member) => member.displayName)
                    .join(' · ')}
                  {group.members.length > 4
                    ? ` ${t('students.groups.moreMembers', { count: group.members.length - 4 })}`
                    : ''}
                </p>
              ) : null}

              <div className={styles.groupCardActions}>
                <Button type="button" variant="default" onClick={() => startEdit(group)}>
                  {t('students.groups.edit')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => void onDelete(group.id)}>
                  {t('students.groups.delete')}
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
