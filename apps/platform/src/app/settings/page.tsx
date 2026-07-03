import {
  platformGet,
  PlatformApiError,
  type PaymentAllowlistDto,
} from '../../lib/platform-api';
import { Unauthorized } from '../../components/Unauthorized';
import { PaymentAllowlistEditor } from '../../components/PaymentAllowlistEditor';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let allowlist: PaymentAllowlistDto;
  try {
    allowlist = await platformGet<PaymentAllowlistDto>('/platform/payment-methods');
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Settings</h1>
      <h2 style={{ fontSize: '1.1rem', marginTop: 24 }}>Payment-method allowlist</h2>
      <PaymentAllowlistEditor
        allMethods={allowlist.allMethods}
        initialAllowed={allowlist.allowed}
      />
    </div>
  );
}
