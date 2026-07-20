import { Package } from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
} from '../../../../lib/platform-api';
import { Unauthorized } from '../../../../components/Unauthorized';
import {
  CampusSubscriptionEditor,
  type CampusSubscriptionClientDto,
} from '../../../../components/CampusSubscriptionEditor';
import { PageHeader, PageStack } from '../../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function CampusPlansPage() {
  let product: CampusSubscriptionClientDto;
  try {
    product = await platformGet<CampusSubscriptionClientDto>(
      '/platform/billing/campus-subscription',
    );
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <PageStack>
      <PageHeader
        icon={<Package size={22} aria-hidden />}
        title="Campus plans"
        description="Default subscription offer and per-country overrides (rail + price)."
      />
      <CampusSubscriptionEditor initial={product} />
    </PageStack>
  );
}
