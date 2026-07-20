import SignupPageClient from './SignupPageClient';
import { authPageMetadata } from '../auth-page-seo';

export const generateMetadata = authPageMetadata({
  slug: 'signup',
  path: '/signup',
  fallbackTitle: 'Create account',
});

export default function SignupPage() {
  return <SignupPageClient />;
}
