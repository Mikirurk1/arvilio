import {
  platformGet,
  PlatformApiError,
  type PromoCodeDto,
} from '../../lib/platform-api';
import { Unauthorized } from '../../components/Unauthorized';
import { PromoCodesManager } from '../../components/PromoCodesManager';

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
    <div>
      <h1 style={{ marginTop: 0 }}>Promo codes</h1>
      <PromoCodesManager initial={codes} />
    </div>
  );
}
