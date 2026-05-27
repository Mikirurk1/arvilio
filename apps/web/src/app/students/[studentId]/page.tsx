import StudentDetailsPage from './StudentDetailsPage';

/** Server entry — avoids segment `loading.tsx` Suspense swap over client AppShell. */
export default function StudentDetailsRoutePage() {
  return <StudentDetailsPage />;
}
