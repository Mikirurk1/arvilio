import ForgotPasswordPageClient from './ForgotPasswordPageClient';
import { authPageMetadata } from '../auth-page-seo';

export const generateMetadata = authPageMetadata({
  slug: 'forgot',
  path: '/forgot-password',
  fallbackTitle: 'Forgot password',
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
