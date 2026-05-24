'use client';

import { create } from 'zustand';

export type ConfirmVariant = 'default' | 'danger';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** Shown on the confirm button while `onConfirm` runs. */
  loadingLabel?: string;
  /** Runs on confirm; dialog stays open until this settles. Loading is shown on the confirm button. */
  onConfirm?: () => void | Promise<void>;
};

type AlertOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
};

type ConfirmDialogState = {
  open: boolean;
  mode: 'confirm' | 'alert';
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  loadingLabel?: string;
  variant: ConfirmVariant;
  onConfirm: (() => void | Promise<void>) | null;
  confirming: boolean;
  resolve: ((value: boolean) => void) | null;
  openConfirm: (options: ConfirmOptions, resolve: (value: boolean) => void) => void;
  openAlert: (options: AlertOptions, resolve: () => void) => void;
  setConfirming: (confirming: boolean) => void;
  close: (result: boolean) => void;
};

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  open: false,
  mode: 'confirm',
  title: '',
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  loadingLabel: undefined,
  onConfirm: null,
  confirming: false,
  resolve: null,

  openConfirm: (options, resolve) => {
    set({
      open: true,
      mode: 'confirm',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? (options.variant === 'danger' ? 'Delete' : 'Confirm'),
      cancelLabel: options.cancelLabel ?? 'Cancel',
      loadingLabel: options.loadingLabel,
      variant: options.variant ?? 'default',
      onConfirm: options.onConfirm ?? null,
      confirming: false,
      resolve,
    });
  },

  setConfirming: (confirming) => set({ confirming }),

  openAlert: (options, resolve) => {
    set({
      open: true,
      mode: 'alert',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'OK',
      cancelLabel: 'Cancel',
      variant: 'default',
      resolve: () => resolve(),
    });
  },

  close: (result) => {
    const { resolve } = get();
    resolve?.(result);
    set({
      open: false,
      resolve: null,
      onConfirm: null,
      confirming: false,
      loadingLabel: undefined,
    });
  },
}));

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmDialogStore.getState().openConfirm(options, resolve);
  });
}

export function alertDialog(options: AlertOptions): Promise<void> {
  return new Promise((resolve) => {
    useConfirmDialogStore.getState().openAlert(options, resolve);
  });
}
