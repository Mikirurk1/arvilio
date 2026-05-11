import type { ReactNode } from 'react';
import { Button } from './Button';
import uiStyles from './ui.module.scss';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  ariaLabel: string;
  className?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
  optionClassName,
  activeOptionClassName,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={[uiStyles.segmentedRoot, className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={ariaLabel}
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
          onClick={() => onValueChange(option.value)}
        >
          {option.icon ? <span className={uiStyles.segmentedIcon}>{option.icon}</span> : null}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
