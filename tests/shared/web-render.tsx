import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

type WrapperProps = { children: ReactNode };

/** Render with optional wrapper (extend for Providers when needed). */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { wrapper?: React.ComponentType<WrapperProps> },
) {
  const Wrapper = options?.wrapper ?? (({ children }: WrapperProps) => <>{children}</>);
  return render(ui, { ...options, wrapper: Wrapper });
}

export const mockAuthStoreState = {
  user: null as { id: string; email: string; role: string } | null,
  status: 'idle' as const,
};
