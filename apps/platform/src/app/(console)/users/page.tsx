import { Users } from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
  type PlatformUserStatsDto,
} from '../../../lib/platform-api';
import { Unauthorized } from '../../../components/Unauthorized';
import { UsersDirectory } from '../../../components/UsersDirectory';
import { PageHeader, PageStack } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let stats: PlatformUserStatsDto;
  try {
    stats = await platformGet<PlatformUserStatsDto>('/platform/users/stats');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <PageStack>
      <PageHeader
        icon={<Users size={22} aria-hidden />}
        title="Users"
        description="Global identity directory across all campuses (ADR-006)."
      />
      <UsersDirectory initialStats={stats} />
    </PageStack>
  );
}
