'use client';

import type { MyProfileDto } from '@pkg/types';
import { PROFICIENCY_LEVEL, TIME_ZONE } from '@pkg/types';
import { EmptyStateCard } from '../../components/ui';
import { UnifiedProfilePanel } from '../../components/profile/UnifiedProfilePanel';
import {
  myProfileToUnified,
  unifiedToMyProfile,
} from '../../components/profile/profile-form-adapters';
import type {
  ProfileFormContext,
  UnifiedProfileFormValues,
} from '../../components/profile/unified-profile-types';
import { useActiveUser } from '../../lib/active-user';

type StaffProfilePanelProps = {
  profile: MyProfileDto | null;
  roleLabel: string;
  onChange: (next: MyProfileDto) => void;
  loading?: boolean;
  saving?: boolean;
  feedback?: string | null;
  onSave: () => void;
};

function placeholderValues(roleLabel: string): UnifiedProfileFormValues {
  return {
    displayName: '',
    email: '',
    phone: '',
    telegram: '',
    timezoneId: TIME_ZONE.kyiv.id,
    nativeLanguageId: '',
    proficiencyLevelId: PROFICIENCY_LEVEL.b1.id,
    bio: '',
    staffStatus: 'active',
    roleLabel,
  };
}

export function StaffProfilePanel({
  profile,
  roleLabel,
  onChange,
  loading = false,
  saving = false,
  feedback = null,
  onSave,
}: StaffProfilePanelProps) {
  const activeUser = useActiveUser();

  if (!loading && !profile) {
    return (
      <EmptyStateCard title="Could not load profile" description="Try refreshing the page." />
    );
  }

  const values = profile ? myProfileToUnified(profile, roleLabel) : placeholderValues(roleLabel);

  const context: ProfileFormContext = {
    subjectKind: 'staff',
    viewerRole: activeUser.role,
    canEdit: !saving,
  };

  return (
    <UnifiedProfilePanel
      values={values}
      onChange={(patch) => {
        if (!profile) return;
        const next = { ...values, ...patch };
        onChange(unifiedToMyProfile(profile, next));
      }}
      context={context}
      loading={loading}
      saving={saving}
      feedback={feedback}
      onSave={onSave}
      saveLabel="Save profile"
      idPrefix="staff-profile"
    />
  );
}

export { staffProfileSummaryItems } from './StaffProfileFields';
