import { ReactNode } from 'react';

export const metadata = {
  title: 'SoEnglish — Sign in',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div data-auth-route>{children}</div>;
}
