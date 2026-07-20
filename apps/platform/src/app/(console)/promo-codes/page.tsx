import { Ticket } from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
  type PromoCodeDto,
} from '../../../lib/platform-api';
import { Unauthorized } from '../../../components/Unauthorized';
import { PromoCodesManager } from '../../../components/PromoCodesManager';
import { PageHeader, PageStack, Panel } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function PromoCodesPage() {
  let codes: PromoCodeDto[];
  try {
    codes = await platformGet<PromoCodeDto[]>('/platform/promo-codes');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <PageStack>
      <PageHeader
        icon={<Ticket size={22} aria-hidden />}
        title="Promo codes"
        description="Trial promo codes for Campus self-serve activation."
      />
      <Panel title="Create & manage" icon={<Ticket size={16} aria-hidden />} variant="flush">
        <PromoCodesManager initial={codes} />
      </Panel>
    </PageStack>
  );
}
