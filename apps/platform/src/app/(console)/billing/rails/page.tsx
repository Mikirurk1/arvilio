import { CreditCard } from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
} from '../../../../lib/platform-api';
import { Unauthorized } from '../../../../components/Unauthorized';
import {
  PlatformBillingRailsEditor,
  type PlatformBillingRailClientDto,
} from '../../../../components/PlatformBillingRailsEditor';
import { PageHeader, PageStack, Panel } from '../../../../components/ui';

export const dynamic = 'force-dynamic';

type BillingRailsDto = {
  rails: PlatformBillingRailClientDto[];
  defaultRailId: string;
};

export default async function BillingRailsPage() {
  let billingRails: BillingRailsDto;
  try {
    billingRails = await platformGet<BillingRailsDto>('/platform/billing/rails');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <PageStack>
      <PageHeader
        icon={<CreditCard size={22} aria-hidden />}
        title="Payment rails"
        description="Platform PSP adapters and secrets for Campus subscriptions."
      />
      <Panel title="Adapters" icon={<CreditCard size={16} aria-hidden />} variant="flush">
        <PlatformBillingRailsEditor initial={billingRails} />
      </Panel>
    </PageStack>
  );
}
