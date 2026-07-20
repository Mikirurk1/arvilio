'use client';

import type React from 'react';
import type { StudentSummaryBackendDto } from '@pkg/types';
import { UserPlus, Users, X } from 'lucide-react';
import { Badge, Button, Field, SurfaceCard } from '../../components/ui';
import { StudentSelectField } from '../../components/students';
import { useCampusT } from '../../lib/cms';
import type { GroupDraft } from './group-utils';
import { isGroupEligibleStudent } from './group-utils';
import styles from './page.module.scss';

interface GroupEditorCardProps {
  editingId: string;
  draft: GroupDraft;
  setDraft: React.Dispatch<React.SetStateAction<GroupDraft>>;
  teachers: Array<{ id: string; displayName: string }>;
  payerCandidates: StudentSummaryBackendDto[];
  draftMembers: Array<{ id: string; displayName: string; email: string }>;
  showAddMember: boolean;
  setShowAddMember: (v: boolean) => void;
  addMemberKey: number;
  saveError: string | null;
  setSaveError: (v: string | null) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  onAddMember: (student: StudentSummaryBackendDto) => void;
  onRemoveMember: (studentId: string) => void;
}

export function GroupEditorCard({
  editingId, draft, setDraft, teachers, payerCandidates, draftMembers,
  showAddMember, setShowAddMember, addMemberKey,
  saveError, setSaveError, saving, onSave, onClose, onAddMember, onRemoveMember,
}: GroupEditorCardProps) {
  const t = useCampusT();

  return (
    <SurfaceCard className={styles.groupEditorCard}>
      <div className={styles.groupEditorHeader}>
        <div className={styles.groupEditorHeaderIcon} aria-hidden>
          <Users size={18} />
        </div>
        <div>
          <h2 className={styles.groupEditorTitle}>
            {editingId === 'new'
              ? t('students.groups.editor.createTitle')
              : t('students.groups.editor.editTitle')}
          </h2>
          <p className={styles.groupEditorSubtitle}>{t('students.groups.editor.subtitle')}</p>
        </div>
      </div>

      {saveError ? (
        <div className={styles.groupEditorError} role="alert">
          {saveError}
        </div>
      ) : null}

      <div className={styles.groupEditorBody}>
        <section className={styles.groupEditorSection}>
          <h3 className={styles.groupEditorSectionTitle}>{t('students.groups.editor.basics')}</h3>
          <div className={styles.groupEditorFieldGrid}>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-name">
                {t('students.groups.editor.nameLabel')}
              </label>
              <Field
                id="group-name"
                className={styles.groupEditorInput}
                value={draft.name}
                placeholder={t('students.groups.editor.namePlaceholder')}
                onChange={(e) => {
                  setSaveError(null);
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-teacher">
                {t('students.groups.editor.teacherLabel')}
              </label>
              <Field
                id="group-teacher"
                as="select"
                className={styles.groupEditorInput}
                value={draft.teacherId}
                onChange={(e) => {
                  setSaveError(null);
                  setDraft((prev) => ({ ...prev, teacherId: e.target.value }));
                }}
              >
                <option value="">{t('students.groups.editor.noTeacherOption')}</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.displayName}
                  </option>
                ))}
              </Field>
            </div>
          </div>
        </section>

        <section className={styles.groupEditorSection}>
          <h3 className={styles.groupEditorSectionTitle}>
            {t('students.groups.editor.billingTitle')}
          </h3>
          <p className={styles.groupEditorSectionHint}>{t('students.groups.editor.billingHint')}</p>
          <div className={styles.groupEditorFieldGrid}>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-billing-mode">
                {t('students.groups.editor.billingModeLabel')}
              </label>
              <Field
                id="group-billing-mode"
                as="select"
                className={styles.groupEditorInput}
                value={draft.groupBillingMode}
                onChange={(e) => {
                  setSaveError(null);
                  setDraft((prev) => ({
                    ...prev,
                    groupBillingMode: e.target.value as GroupDraft['groupBillingMode'],
                  }));
                }}
              >
                <option value="per_member">{t('students.groups.editor.billingPerMemberOption')}</option>
                <option value="fixed_total">{t('students.groups.editor.billingFixedOption')}</option>
              </Field>
            </div>
            {draft.groupBillingMode === 'fixed_total' ? (
              <>
                <div className={styles.groupEditorField}>
                  <label className={styles.groupEditorLabel} htmlFor="group-price">
                    {t('students.groups.editor.amountLabel')}
                  </label>
                  <Field
                    id="group-price"
                    type="number"
                    min={0}
                    className={styles.groupEditorInput}
                    value={String(draft.groupPriceMinor)}
                    onChange={(e) => {
                      setSaveError(null);
                      setDraft((prev) => ({
                        ...prev,
                        groupPriceMinor: Math.max(0, Number(e.target.value) || 0),
                      }));
                    }}
                    placeholder={t('students.groups.editor.amountPlaceholder')}
                  />
                </div>
                <div className={styles.groupEditorField}>
                  <label className={styles.groupEditorLabel} htmlFor="group-currency">
                    {t('students.groups.editor.currencyLabel')}
                  </label>
                  <Field
                    id="group-currency"
                    className={styles.groupEditorInput}
                    value={draft.groupCurrency}
                    onChange={(e) => {
                      setSaveError(null);
                      setDraft((prev) => ({ ...prev, groupCurrency: e.target.value.toUpperCase() }));
                    }}
                  />
                </div>
                <div className={styles.groupEditorField}>
                  <label className={styles.groupEditorLabel} htmlFor="group-split">
                    {t('students.groups.editor.splitLabel')}
                  </label>
                  <Field
                    id="group-split"
                    as="select"
                    className={styles.groupEditorInput}
                    value={draft.groupSplitMode}
                    onChange={(e) => {
                      setSaveError(null);
                      setDraft((prev) => ({
                        ...prev,
                        groupSplitMode: e.target.value as GroupDraft['groupSplitMode'],
                      }));
                    }}
                  >
                    <option value="equal_split">{t('students.groups.editor.splitEqual')}</option>
                    <option value="single_payer">{t('students.groups.editor.splitSinglePayer')}</option>
                  </Field>
                </div>
                {draft.groupSplitMode === 'single_payer' ? (
                  <div className={styles.groupEditorField}>
                    <label className={styles.groupEditorLabel}>
                      {t('students.groups.editor.payerLabel')}
                    </label>
                    <StudentSelectField
                      className={styles.groupEditorInput}
                      value={draft.groupPayerUserId}
                      staticStudents={payerCandidates}
                      placeholder={t('students.groups.editor.payerPlaceholder')}
                      searchPlaceholder={t('students.groups.editor.searchMembersPlaceholder')}
                      onValueChange={(nextValue) => {
                        setSaveError(null);
                        setDraft((prev) => ({ ...prev, groupPayerUserId: nextValue }));
                      }}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>

        <section className={styles.groupEditorSection}>
          <div className={styles.groupMembersHead}>
            <div>
              <h3 className={styles.groupEditorSectionTitle}>
                {t('students.groups.editor.membersTitle')}
              </h3>
              <p className={styles.groupEditorSectionHint}>
                {t('students.groups.editor.membersHint')}
              </p>
            </div>
            <Badge
              variant={draft.memberUserIds.length >= 2 ? 'green' : 'neutral'}
              size="sm"
            >
              {t('students.groups.editor.membersSelected', {
                count: draft.memberUserIds.length,
              })}
            </Badge>
          </div>

          {draftMembers.length > 0 ? (
            <ul className={styles.groupMemberChips}>
              {draftMembers.map((member) => (
                <li key={member.id} className={styles.groupMemberChip}>
                  <span className={styles.groupMemberChipName}>{member.displayName}</span>
                  {member.email ? (
                    <span className={styles.groupMemberChipMeta}>{member.email}</span>
                  ) : null}
                  <Button
                    variant="bare"
                    type="button"
                    className={styles.groupMemberChipRemove}
                    aria-label={t('students.groups.editor.removeMemberAria', {
                      name: member.displayName,
                    })}
                    onClick={() => onRemoveMember(member.id)}
                  >
                    <X size={14} aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.groupMembersEmpty}>
              {t('students.groups.editor.membersEmpty')}
            </div>
          )}

          {showAddMember ? (
            <div className={styles.groupAddMemberPanel}>
              <StudentSelectField
                key={addMemberKey}
                className={styles.groupEditorInput}
                value=""
                placeholder={t('students.groups.editor.addMemberPlaceholder')}
                searchPlaceholder={t('students.groups.editor.searchStudentsPlaceholder')}
                filter={(student) =>
                  isGroupEligibleStudent(student) &&
                  !draft.memberUserIds.includes(student.id)
                }
                onValueChange={(_, student) => {
                  if (student) onAddMember(student);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddMember(false)}
              >
                {t('students.groups.editor.cancel')}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              className={styles.groupAddMemberTrigger}
              startIcon={<UserPlus size={16} />}
              onClick={() => setShowAddMember(true)}
            >
              {t('students.groups.editor.addMember')}
            </Button>
          )}
        </section>
      </div>

      <div className={styles.groupEditorFooter}>
        <Button type="button" disabled={saving} onClick={onSave}>
          {saving
            ? t('students.groups.editor.saving')
            : editingId === 'new'
              ? t('students.groups.editor.createAction')
              : t('students.groups.editor.saveAction')}
        </Button>
        <Button type="button" variant="default" disabled={saving} onClick={onClose}>
          {t('students.groups.editor.cancel')}
        </Button>
      </div>
    </SurfaceCard>
  );
}
