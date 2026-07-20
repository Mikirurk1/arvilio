import ResetPasswordPageClient from './ResetPasswordPageClient';
import { authPageMetadata } from '../auth-page-seo';

export const generateMetadata = authPageMetadata({
  slug: 'reset',
  path: '/reset-password',
  fallbackTitle: 'Reset password',
});

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />;
}
