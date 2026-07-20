import { alertDialog, confirmDialog, useConfirmDialogStore } from './confirm-dialog-store';

describe('confirm-dialog-store', () => {
  beforeEach(() => {
    useConfirmDialogStore.setState({
      open: false,
      mode: 'confirm',
      title: '',
      confirming: false,
      resolve: null,
      onConfirm: null,
    });
  });

  it('openConfirm sets dialog state', () => {
    const resolve = jest.fn();
    useConfirmDialogStore.getState().openConfirm(
      { title: 'Delete?', variant: 'danger' },
      resolve,
    );
    expect(useConfirmDialogStore.getState().open).toBe(true);
    expect(useConfirmDialogStore.getState().title).toBe('Delete?');
  });

  it('close resolves with result', () => {
    const resolve = jest.fn();
    useConfirmDialogStore.getState().openConfirm({ title: 'Sure?' }, resolve);
    useConfirmDialogStore.getState().close(true);
    expect(resolve).toHaveBeenCalledWith(true);
    expect(useConfirmDialogStore.getState().open).toBe(false);
  });

  it('openAlert uses alert mode and OK label', () => {
    const resolve = jest.fn();
    useConfirmDialogStore.getState().openAlert({ title: 'Saved' }, resolve);
    expect(useConfirmDialogStore.getState().mode).toBe('alert');
    expect(useConfirmDialogStore.getState().confirmLabel).toBe('OK');
  });

  it('setConfirming toggles loading state', () => {
    useConfirmDialogStore.getState().setConfirming(true);
    expect(useConfirmDialogStore.getState().confirming).toBe(true);
  });

  it('confirmDialog and alertDialog return promises', async () => {
    const confirmPromise = confirmDialog({ title: 'Proceed?' });
    useConfirmDialogStore.getState().close(false);
    await expect(confirmPromise).resolves.toBe(false);

    const alertPromise = alertDialog({ title: 'Done' });
    useConfirmDialogStore.getState().close(true);
    await expect(alertPromise).resolves.toBeUndefined();
  });
});
