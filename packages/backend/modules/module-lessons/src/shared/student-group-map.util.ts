import type {
  CreateStudentGroupRequestDto,
  GroupFixedSplitMode,
  GroupLessonBillingMode,
  StudentGroupDto,
} from '@pkg/types';
import {
  groupBillingModeFromDto,
  groupBillingModeToDto,
  groupSplitModeFromDto,
  groupSplitModeToDto,
} from './lessons-map.util';

type StudentGroupRow = {
  id: string;
  name: string;
  teacherId: string | null;
  groupBillingMode: 'PER_MEMBER' | 'FIXED_TOTAL';
  groupPriceMinor: number | null;
  groupCurrency: string | null;
  groupSplitMode: 'SINGLE_PAYER' | 'EQUAL_SPLIT' | null;
  groupPayerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacher: { displayName: string } | null;
  members: Array<{
    userId: string;
    sortOrder: number;
    user: { displayName: string };
  }>;
};

export function mapStudentGroup(row: StudentGroupRow): StudentGroupDto {
  return {
    id: row.id,
    name: row.name,
    teacherId: row.teacherId,
    teacherName: row.teacher?.displayName ?? null,
    groupBillingMode: groupBillingModeToDto(row.groupBillingMode),
    groupPriceMinor: row.groupPriceMinor,
    groupCurrency: row.groupCurrency,
    groupSplitMode: row.groupSplitMode ? groupSplitModeToDto(row.groupSplitMode) : null,
    groupPayerUserId: row.groupPayerUserId,
    members: row.members
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((member) => ({
        userId: member.userId,
        displayName: member.user.displayName,
        sortOrder: member.sortOrder,
      })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function billingFieldsFromGroupInput(body: {
  groupBillingMode: GroupLessonBillingMode;
  groupPriceMinor?: number;
  groupCurrency?: string;
  groupSplitMode?: GroupFixedSplitMode;
  groupPayerUserId?: string | null;
}) {
  const mode = groupBillingModeFromDto(body.groupBillingMode);
  return {
    groupBillingMode: mode,
    groupPriceMinor: mode === 'FIXED_TOTAL' ? (body.groupPriceMinor ?? null) : null,
    groupCurrency: mode === 'FIXED_TOTAL' ? body.groupCurrency?.trim() ?? null : null,
    groupSplitMode:
      mode === 'FIXED_TOTAL' && body.groupSplitMode
        ? groupSplitModeFromDto(body.groupSplitMode)
        : null,
    groupPayerUserId:
      mode === 'FIXED_TOTAL' && body.groupSplitMode === 'single_payer'
        ? body.groupPayerUserId ?? null
        : null,
  };
}

export function billingSnapshotFromGroup(group: {
  groupBillingMode: 'PER_MEMBER' | 'FIXED_TOTAL';
  groupPriceMinor: number | null;
  groupCurrency: string | null;
  groupSplitMode: 'SINGLE_PAYER' | 'EQUAL_SPLIT' | null;
  groupPayerUserId: string | null;
}) {
  return {
    groupBillingMode: group.groupBillingMode,
    groupPriceMinor: group.groupPriceMinor,
    groupCurrency: group.groupCurrency,
    groupSplitMode: group.groupSplitMode,
    groupPayerUserId: group.groupPayerUserId,
  };
}

export function assertStudentGroupBillingInput(body: CreateStudentGroupRequestDto): void {
  const mode = groupBillingModeFromDto(body.groupBillingMode);
  if (mode === 'FIXED_TOTAL') {
    if (body.groupPriceMinor == null || body.groupPriceMinor < 0) {
      throw new Error('Group price is required for fixed total billing');
    }
    if (!body.groupCurrency?.trim()) {
      throw new Error('Currency is required for fixed total billing');
    }
    if (!body.groupSplitMode) {
      throw new Error('Split mode is required for fixed total billing');
    }
    if (
      body.groupSplitMode === 'single_payer' &&
      (!body.groupPayerUserId || !body.memberUserIds.includes(body.groupPayerUserId))
    ) {
      throw new Error('Payer must be one of the group members');
    }
  }
}
