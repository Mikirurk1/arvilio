import { useNotificationsStore } from './notifications-store';

describe('notifications-store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useNotificationsStore.setState({ toasts: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('pushToast adds toast and removeToast clears it', () => {
    const id = useNotificationsStore.getState().pushToast({
      title: 'Saved',
      kind: 'success',
    });
    expect(useNotificationsStore.getState().toasts).toHaveLength(1);
    expect(useNotificationsStore.getState().toasts[0]?.kind).toBe('success');
    useNotificationsStore.getState().removeToast(id);
    expect(useNotificationsStore.getState().toasts).toHaveLength(0);
  });

  it('pushToast uses custom id and replaces duplicate', () => {
    useNotificationsStore.getState().pushToast({ id: 'fixed', title: 'First' });
    useNotificationsStore.getState().pushToast({ id: 'fixed', title: 'Second', kind: 'warning' });
    const toasts = useNotificationsStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toBe('Second');
    expect(toasts[0]?.kind).toBe('warning');
  });

  it('pushToast defaults kind to info and stores description', () => {
    useNotificationsStore.getState().pushToast({
      title: 'Note',
      description: 'Details',
      durationMs: 1000,
    });
    const toast = useNotificationsStore.getState().toasts[0];
    expect(toast?.kind).toBe('info');
    expect(toast?.description).toBe('Details');
    expect(toast?.durationMs).toBe(1000);
  });

  it('pushToast keeps at most five toasts', () => {
    for (let i = 0; i < 7; i += 1) {
      useNotificationsStore.getState().pushToast({ title: `Toast ${i}` });
    }
    expect(useNotificationsStore.getState().toasts).toHaveLength(5);
    expect(useNotificationsStore.getState().toasts[0]?.title).toBe('Toast 6');
  });

  it('auto removes toast after duration', () => {
    useNotificationsStore.getState().pushToast({ title: 'Auto', durationMs: 500 });
    expect(useNotificationsStore.getState().toasts).toHaveLength(1);
    jest.advanceTimersByTime(500);
    expect(useNotificationsStore.getState().toasts).toHaveLength(0);
  });

  it('clearToasts removes all', () => {
    useNotificationsStore.getState().pushToast({ title: 'A' });
    useNotificationsStore.getState().pushToast({ title: 'B' });
    useNotificationsStore.getState().clearToasts();
    expect(useNotificationsStore.getState().toasts).toHaveLength(0);
  });
});
