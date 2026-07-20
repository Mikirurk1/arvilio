import { ScrollText } from 'lucide-react';
import { PageHeader, PageStack } from '../../../components/ui';
import { AuditLogTable } from '../../../components/AuditLogTable';

export const dynamic = 'force-dynamic';

export default function AuditLogPage() {
  return (
    <PageStack>
      <PageHeader
        icon={<ScrollText size={22} aria-hidden />}
        title="Audit log"
        description="Cross-tenant operator actions recorded by the Control Plane."
      />
      <AuditLogTable />
    </PageStack>
  );
}
