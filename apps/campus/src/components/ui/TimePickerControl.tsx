'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Clock3 } from 'lucide-react';
import {
  formatTimeLabel,
  formatTimeValue,
  parseTimeValue,
  TIME_HOUR_OPTIONS,
  TIME_MINUTE_OPTIONS,
} from '../../lib/date-picker-utils';
import pickerStyles from './picker.module.scss';
import uiStyles from './ui.module.scss';
import { PickerPopover } from './PickerPopover';
import { usePickerMobile } from './use-picker-mobile';

export type TimePickerControlProps = {
  id?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

export function TimePickerControl({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: TimePickerControlProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const isMobile = usePickerMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseTimeValue(value);
  const hour = parsed?.hour ?? 9;
  const minute = parsed?.minute ?? 0;
  const snappedMinute = TIME_MINUTE_OPTIONS.reduce((best, option) =>
    Math.abs(option - minute) < Math.abs(best - minute) ? option : best,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if ((event.target as Element).closest?.(`[data-picker-popover]`)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const emitChange = (nextHour: number, nextMinute: number) => {
    onChange?.({
      target: { value: formatTimeValue(nextHour, nextMinute) },
    } as ChangeEvent<HTMLInputElement>);
  };

  if (isMobile) {
    return (
      <input
        id={inputId}
        type="time"
        className={[uiStyles.fieldControl, className].filter(Boolean).join(' ') || undefined}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onChange={onChange}
      />
    );
  }

  const triggerClass = [
    pickerStyles.trigger,
    className,
    open ? pickerStyles.triggerOpen : '',
    !value ? pickerStyles.triggerPlaceholder : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={pickerStyles.wrap}>
      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        className={triggerClass}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{formatTimeLabel(value, placeholder)}</span>
        <Clock3 size={16} className={pickerStyles.triggerIcon} aria-hidden />
      </button>
      <PickerPopover open={open} anchorEl={triggerRef.current} minWidth={240}>
        <div data-picker-popover className={pickerStyles.timeColumns}>
          <div className={pickerStyles.timeColumn}>
            <span className={pickerStyles.timeColumnLabel}>Hour</span>
            {TIME_HOUR_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={[
                  pickerStyles.timeOption,
                  option === hour ? pickerStyles.timeOptionActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => emitChange(option, snappedMinute)}
              >
                {String(option).padStart(2, '0')}
              </button>
            ))}
          </div>
          <div className={pickerStyles.timeColumn}>
            <span className={pickerStyles.timeColumnLabel}>Min</span>
            {TIME_MINUTE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={[
                  pickerStyles.timeOption,
                  option === snappedMinute ? pickerStyles.timeOptionActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  emitChange(hour, option);
                  setOpen(false);
                }}
              >
                {String(option).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </PickerPopover>
    </div>
  );
}
