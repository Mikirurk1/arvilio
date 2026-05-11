'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import uiStyles from './ui.module.scss';

type ClickHandler = MouseEventHandler<HTMLButtonElement> | Array<() => void>;

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'style'> & {
  variant?: 'default' | 'ghost' | 'dashed';
  active?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  loadingAriaLabel?: string;
  classNames?: {
    root?: string;
    startIcon?: string;
    text?: string;
    endIcon?: string;
    active?: string;
  };
  className?: string;
  style?: CSSProperties;
  onClick?: ClickHandler;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'default',
    active = false,
    startIcon,
    endIcon,
    classNames = {},
    className,
    style,
    onClick,
    loading = false,
    loadingAriaLabel,
    disabled: disabledProp,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const computedDisabled = loading ? true : disabledProp;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!onClick || loading) return;
    if (Array.isArray(onClick)) {
      onClick.forEach((fn) => fn());
      return;
    }
    onClick(event);
  };

  const rootClassName = [classNames.root, className, active ? classNames.active : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-active={active ? 'true' : 'false'}
      className={[uiStyles.buttonBase, uiStyles[`buttonVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`], rootClassName]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={handleClick}
      disabled={computedDisabled}
      {...props}
    >
      {startIcon ? (
        <span className={classNames.startIcon} aria-hidden>
          {startIcon}
        </span>
      ) : null}
      {loading ? (
        <span className={uiStyles.buttonLoadingWrap} aria-label={loadingAriaLabel} role="status">
          <span className={uiStyles.buttonLoader} />
        </span>
      ) : children ? (
        classNames.text ? <span className={classNames.text}>{children}</span> : children
      ) : null}
      {endIcon ? (
        <span className={classNames.endIcon} aria-hidden>
          {endIcon}
        </span>
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
