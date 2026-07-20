import { render, screen, fireEvent } from '@testing-library/react';
import { ArviProvider } from '../mascot/useArvi';
import { ArviChatProvider, useArviChat } from './useArviChat';
import { GlobalArviSlot } from '../mascot/GlobalArviSlot';

jest.mock('../../lib/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: 'STUDENT' } }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

jest.mock('../../lib/cms', () => ({
  useCampusT: () => (key: string) => key,
}));

function OpenFlag() {
  const { open } = useArviChat();
  return <span data-testid="open-flag">{open ? 'yes' : 'no'}</span>;
}

describe('GlobalArviSlot assistant open', () => {
  it('toggles chat when Arvi is activated', () => {
    render(
      <ArviProvider>
        <ArviChatProvider>
          <OpenFlag />
          <GlobalArviSlot />
        </ArviChatProvider>
      </ArviProvider>,
    );
    expect(screen.getByTestId('open-flag')).toHaveTextContent('no');
    fireEvent.click(screen.getByRole('button', { name: 'assistant.open' }));
    expect(screen.getByTestId('open-flag')).toHaveTextContent('yes');
  });
});
