'use client';

import type { StaffPayoutStatusDto } from '@pkg/types';
import { Badge } from '../../components/ui';
import { staffPayoutStatusBadgeVariant, staffPayoutStatusLabel } from '../../lib/staff-payout-ui';

type StaffPayoutStatusBadgeProps = {
  status: StaffPayoutStatusDto;
  size?: 'sm' | 'md';
};

export function StaffPayoutStatusBadge({ status, size = 'sm' }: StaffPayoutStatusBadgeProps) {
  return (
    <Badge variant={staffPayoutStatusBadgeVariant(status)} size={size}>
      {staffPayoutStatusLabel(status)}
    </Badge>
  );
}
