import type { ReactNode } from 'react';
import { Button } from './Button';
import uiStyles from './ui.module.scss';

export type SettingsToggleRowProps = {
  label: ReactNode;
  /** Accessible label for the toggle button — required when `label` is not a plain string. */
  'aria-label'?: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  infoClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  toggleClassName?: string;
  toggleOnClassName?: string;
  thumbClassName?: string;
};

export function SettingsToggleRow({
  label,
  'aria-label': ariaLabel,
  description,
  checked,
  onChange,
  disabled = false,
  className,
  infoClassName,
  labelClassName,
  descriptionClassName,
  toggleClassName,
  toggleOnClassName,
  thumbClassName,
}: SettingsToggleRowProps) {
  return (
    <div className={[uiStyles.actionRow, className].filter(Boolean).join(' ')}>
      <div className={[uiStyles.actionRowInfo, infoClassName].filter(Boolean).join(' ')}>
        <div className={[uiStyles.actionRowTitle, labelClassName].filter(Boolean).join(' ')}>{label}</div>
        {description ? (
          <div className={[uiStyles.actionRowDescription, descriptionClassName].filter(Boolean).join(' ')}>
            {description}
          </div>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        className={[
          uiStyles.switchToggle,
          toggleClassName,
          checked ? [uiStyles.switchToggleOn, toggleOnClassName].filter(Boolean).join(' ') : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-pressed={checked}
        aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <div className={[uiStyles.switchThumb, thumbClassName].filter(Boolean).join(' ')} />
      </Button>
    </div>
  );
}
