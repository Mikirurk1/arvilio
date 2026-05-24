import { useUiStore } from './ui-store';

describe('ui-store', () => {
  beforeEach(() => {
    useUiStore.setState({ theme: 'auto', fontSize: 'medium' });
  });

  it('setTheme updates theme', () => {
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
  });

  it('setFontSize updates fontSize', () => {
    useUiStore.getState().setFontSize('large');
    expect(useUiStore.getState().fontSize).toBe('large');
  });
});
