import { Mail, Settings, Sparkles } from 'lucide-react';
import {
  platformGet,
  PlatformApiError,
  type PaymentAllowlistDto,
} from '../../../lib/platform-api';
import { Unauthorized } from '../../../components/Unauthorized';
import { PaymentAllowlistEditor } from '../../../components/PaymentAllowlistEditor';
import {
  PlatformLlmEditor,
  type PlatformLlmClientDto,
} from '../../../components/PlatformLlmEditor';
import {
  PlatformSmtpEditor,
  type PlatformSmtpClientDto,
} from '../../../components/PlatformSmtpEditor';
import { PageHeader, PageStack, Panel } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let allowlist: PaymentAllowlistDto;
  let llm: PlatformLlmClientDto;
  let smtp: PlatformSmtpClientDto;
  try {
    [allowlist, llm, smtp] = await Promise.all([
      platformGet<PaymentAllowlistDto>('/platform/payment-methods'),
      platformGet<PlatformLlmClientDto>('/platform/llm'),
      platformGet<PlatformSmtpClientDto>('/platform/smtp'),
    ]);
  } catch (error) {
    if (error instanceof PlatformApiError && (error.status === 401 || error.status === 403)) {
      return <Unauthorized status={error.status} />;
    }
    throw error;
  }

  return (
    <PageStack>
      <PageHeader
        icon={<Settings size={22} aria-hidden />}
        title="Settings"
        description="Platform-global policy for Campus products. Internal billing lives under Billing."
      />
      <Panel
        title="Transactional email (SMTP)"
        icon={<Mail size={16} aria-hidden />}
        variant="flush"
      >
        <PlatformSmtpEditor initial={smtp} />
      </Panel>
      <Panel
        title="Arvi AI — default model"
        icon={<Sparkles size={16} aria-hidden />}
        variant="flush"
      >
        <PlatformLlmEditor initial={llm} />
      </Panel>
      <Panel title="Learner payment methods" icon={<Settings size={16} aria-hidden />} variant="flush">
        <PaymentAllowlistEditor
          allMethods={allowlist.allMethods}
          initialAllowed={allowlist.allowed}
        />
      </Panel>
    </PageStack>
  );
}
