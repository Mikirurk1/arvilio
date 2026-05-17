'use client';

import { create } from 'zustand';

export type ConfirmVariant = 'default' | 'danger';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
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
  variant: ConfirmVariant;
  resolve: ((value: boolean) => void) | null;
  openConfirm: (options: ConfirmOptions, resolve: (value: boolean) => void) => void;
  openAlert: (options: AlertOptions, resolve: () => void) => void;
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
  resolve: null,

  openConfirm: (options, resolve) => {
    set({
      open: true,
      mode: 'confirm',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? (options.variant === 'danger' ? 'Delete' : 'Confirm'),
      cancelLabel: options.cancelLabel ?? 'Cancel',
      variant: options.variant ?? 'default',
      resolve,
    });
  },

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
