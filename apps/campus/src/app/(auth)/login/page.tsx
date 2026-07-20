import LoginPageClient from './LoginPageClient';
import { authPageMetadata } from '../auth-page-seo';

export const generateMetadata = authPageMetadata({
  slug: 'login',
  path: '/login',
  fallbackTitle: 'Sign in',
});

export default function LoginPage() {
  return <LoginPageClient />;
}
