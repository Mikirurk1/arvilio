import type { ReactNode } from 'react';
import { Button } from './Button';
import uiStyles from './ui.module.scss';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Optional DOM attributes (e.g. data-tour-anchor for product tour). */
  dataAttrs?: Record<string, string | undefined>;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  ariaLabel: string;
  className?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  /** Optional DOM attributes on the radiogroup root (e.g. data-tour-anchor). */
  dataAttrs?: Record<string, string | undefined>;
  /** Avoid focus scroll jump when clicking inside a scrollable page (mouse only). */
  preventScrollOnPointerDown?: boolean;
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
  optionClassName,
  activeOptionClassName,
  dataAttrs,
  preventScrollOnPointerDown = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={[uiStyles.segmentedRoot, className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={ariaLabel}
      {...dataAttrs}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={option.disabled}
          className={[
            uiStyles.segmentedOption,
            optionClassName,
            value === option.value ? [uiStyles.segmentedOptionActive, activeOptionClassName].filter(Boolean).join(' ') : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...option.dataAttrs}
          onMouseDown={
            preventScrollOnPointerDown ? (event) => event.preventDefault() : undefined
          }
          onClick={() => onValueChange(option.value)}
        >
          {option.icon ? <span className={uiStyles.segmentedIcon}>{option.icon}</span> : null}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
