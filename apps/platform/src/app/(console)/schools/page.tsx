import { Building2 } from 'lucide-react';
import { CampusesTable } from '../../../components/CampusesTable';
import { PageHeader, PageStack } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default function CampusesPage() {
  return (
    <PageStack>
      <PageHeader
        icon={<Building2 size={22} aria-hidden />}
        title="Campuses"
        description="Cross-tenant list of Campus organizations (API model: School)."
      />
      <CampusesTable />
    </PageStack>
  );
}
