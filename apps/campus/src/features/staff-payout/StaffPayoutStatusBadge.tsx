'use client';

import type { StaffPayoutStatusDto } from '@pkg/types';
import { Badge } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { staffPayoutStatusBadgeVariant, staffPayoutStatusLabel } from '../../lib/staff-payout-ui';

type StaffPayoutStatusBadgeProps = {
  status: StaffPayoutStatusDto;
  size?: 'sm' | 'md';
};

export function StaffPayoutStatusBadge({ status, size = 'sm' }: StaffPayoutStatusBadgeProps) {
  const t = useCampusT();
  return (
    <Badge variant={staffPayoutStatusBadgeVariant(status)} size={size}>
      {staffPayoutStatusLabel(status, t)}
    </Badge>
  );
}
