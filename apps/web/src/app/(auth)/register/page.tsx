import { redirect } from 'next/navigation';

/** Public registration is disabled; accounts are created by administrators. */
export default function RegisterPage() {
  redirect('/login');
}
