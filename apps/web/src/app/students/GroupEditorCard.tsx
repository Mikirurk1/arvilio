'use client';

import type React from 'react';
import type { StudentSummaryBackendDto } from '@pkg/types';
import { UserPlus, Users, X } from 'lucide-react';
import { Badge, Button, Field, SurfaceCard } from '../../components/ui';
import { StudentSelectField } from '../../components/students';
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
  return (
    <SurfaceCard className={styles.groupEditorCard}>
      <div className={styles.groupEditorHeader}>
        <div className={styles.groupEditorHeaderIcon} aria-hidden>
          <Users size={18} />
        </div>
        <div>
          <h2 className={styles.groupEditorTitle}>
            {editingId === 'new' ? 'New learning group' : 'Edit learning group'}
          </h2>
          <p className={styles.groupEditorSubtitle}>
            Name the group, assign a teacher, set billing defaults, and add at least two
            students.
          </p>
        </div>
      </div>

      {saveError ? (
        <div className={styles.groupEditorError} role="alert">
          {saveError}
        </div>
      ) : null}

      <div className={styles.groupEditorBody}>
        <section className={styles.groupEditorSection}>
          <h3 className={styles.groupEditorSectionTitle}>Basics</h3>
          <div className={styles.groupEditorFieldGrid}>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-name">
                Group name
              </label>
              <Field
                id="group-name"
                className={styles.groupEditorInput}
                value={draft.name}
                placeholder="e.g. B1 Evening cohort"
                onChange={(e) => {
                  setSaveError(null);
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-teacher">
                Assigned teacher
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
                <option value="">— No teacher —</option>
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
          <h3 className={styles.groupEditorSectionTitle}>Billing defaults</h3>
          <p className={styles.groupEditorSectionHint}>
            Copied onto new group lessons. Teachers cannot change prices when scheduling.
          </p>
          <div className={styles.groupEditorFieldGrid}>
            <div className={styles.groupEditorField}>
              <label className={styles.groupEditorLabel} htmlFor="group-billing-mode">
                Billing mode
              </label>
              <Field
                id="group-billing-mode"
                as="select"
                className={styles.groupEditorInput}
                value={draft.groupBillingMode}
                onChange={(e) => {
                  setSaveError(null);
                  setDraft((prev) => ({ ...prev, groupBillingMode: e.target.value as GroupDraft['groupBillingMode'] }));
                }}
              >
                <option value="per_member">1 lesson credit per member</option>
                <option value="fixed_total">Fixed amount per lesson</option>
              </Field>
            </div>
            {draft.groupBillingMode === 'fixed_total' ? (
              <>
                <div className={styles.groupEditorField}>
                  <label className={styles.groupEditorLabel} htmlFor="group-price">
                    Amount (minor units)
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
                    placeholder="45000 = 450.00"
                  />
                </div>
                <div className={styles.groupEditorField}>
                  <label className={styles.groupEditorLabel} htmlFor="group-currency">
                    Currency
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
                    Split mode
                  </label>
                  <Field
                    id="group-split"
                    as="select"
                    className={styles.groupEditorInput}
                    value={draft.groupSplitMode}
                    onChange={(e) => {
                      setSaveError(null);
                      setDraft((prev) => ({ ...prev, groupSplitMode: e.target.value as GroupDraft['groupSplitMode'] }));
                    }}
                  >
                    <option value="equal_split">Split equally</option>
                    <option value="single_payer">Single payer</option>
                  </Field>
                </div>
                {draft.groupSplitMode === 'single_payer' ? (
                  <div className={styles.groupEditorField}>
                    <label className={styles.groupEditorLabel}>Payer</label>
                    <StudentSelectField
                      className={styles.groupEditorInput}
                      value={draft.groupPayerUserId}
                      staticStudents={payerCandidates}
                      placeholder="Select payer"
                      searchPlaceholder="Search members…"
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
              <h3 className={styles.groupEditorSectionTitle}>Members</h3>
              <p className={styles.groupEditorSectionHint}>
                Only students with group or mixed lesson format. Minimum two students.
              </p>
            </div>
            <Badge
              variant={draft.memberUserIds.length >= 2 ? 'green' : 'neutral'}
              size="sm"
            >
              {draft.memberUserIds.length} selected
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
                  <button
                    type="button"
                    className={styles.groupMemberChipRemove}
                    aria-label={`Remove ${member.displayName}`}
                    onClick={() => onRemoveMember(member.id)}
                  >
                    <X size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.groupMembersEmpty}>No students added yet.</div>
          )}

          {showAddMember ? (
            <div className={styles.groupAddMemberPanel}>
              <StudentSelectField
                key={addMemberKey}
                className={styles.groupEditorInput}
                value=""
                placeholder="Search and select a student…"
                searchPlaceholder="Search students…"
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
                Cancel
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
              Add student
            </Button>
          )}
        </section>
      </div>

      <div className={styles.groupEditorFooter}>
        <Button type="button" disabled={saving} onClick={onSave}>
          {saving ? 'Saving…' : editingId === 'new' ? 'Create group' : 'Save changes'}
        </Button>
        <Button type="button" variant="default" disabled={saving} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </SurfaceCard>
  );
}
