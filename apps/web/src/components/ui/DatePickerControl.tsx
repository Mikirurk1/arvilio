'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';
import { Calendar } from 'lucide-react';
import 'react-day-picker/style.css';
import {
  formatDateKey,
  formatDateLabel,
  parseDateKey,
} from '../../lib/date-picker-utils';
import pickerStyles from './picker.module.scss';
import uiStyles from './ui.module.scss';
import { PickerPopover } from './PickerPopover';
import { usePickerMobile } from './use-picker-mobile';

export type DatePickerControlProps = {
  id?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

export function DatePickerControl({
  id,
  value,
  onChange,
  disabled,
  className,
  min,
  max,
  placeholder,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: DatePickerControlProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const isMobile = usePickerMobile();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const selected = parseDateKey(value);
  const minDate = min ? parseDateKey(min) : undefined;
  const maxDate = max ? parseDateKey(max) : undefined;
  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

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

  const emitChange = (next: string) => {
    onChange?.({
      target: { value: next },
    } as ChangeEvent<HTMLInputElement>);
  };

  if (isMobile) {
    return (
      <input
        id={inputId}
        type="date"
        className={[uiStyles.fieldControl, className].filter(Boolean).join(' ') || undefined}
        value={value}
        min={min}
        max={max}
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
        <span>{formatDateLabel(value, placeholder)}</span>
        <Calendar size={16} className={pickerStyles.triggerIcon} aria-hidden />
      </button>
      <PickerPopover
        open={open}
        anchorEl={triggerRef.current}
        minWidth={300}
        matchAnchorWidth={false}
      >
        <div data-picker-popover className={pickerStyles.calendar}>
          <DayPicker
            className={pickerStyles.rdpRoot}
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              emitChange(formatDateKey(date));
              setOpen(false);
            }}
            disabled={disabledDays.length > 0 ? disabledDays : undefined}
            showOutsideDays
          />
        </div>
      </PickerPopover>
    </div>
  );
}
