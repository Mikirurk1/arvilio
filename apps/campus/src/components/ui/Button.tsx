'use client';

import Link from 'next/link';
import { forwardRef, isValidElement, useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import uiStyles from './ui.module.scss';

/** True when `children` has no visible text (icon-only labels like `<Trash2 />` are allowed). */
function hasTextContent(node: ReactNode): boolean {
  if (node == null || node === false) return false;
  if (typeof node === 'string') return node.trim().length > 0;
  if (typeof node === 'number') return true;
  if (Array.isArray(node)) return node.some(hasTextContent);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return hasTextContent(node.props.children);
  }
  return false;
}

type ClickHandler = MouseEventHandler<HTMLButtonElement> | Array<() => void>;

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'then' in value &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'style'> & {
  variant?: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger';
  /** Renders as Next.js Link with button styles (for in-app navigation CTAs). */
  href?: string;
  active?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Controlled loading state (e.g. from parent). */
  loading?: boolean;
  /** Shown next to the spinner while loading; falls back to `children`. */
  loadingLabel?: string;
  loadingAriaLabel?: string;
  /** Called when internal async pending or controlled `loading` changes. */
  onPendingChange?: (pending: boolean) => void;
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
    href,
    active = false,
    startIcon,
    endIcon,
    classNames = {},
    className,
    style,
    onClick,
    loading = false,
    loadingLabel,
    loadingAriaLabel,
    onPendingChange,
    disabled: disabledProp,
    children,
    type = 'button',
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const [pending, setPending] = useState(false);
  const isLoading = loading || pending;

  useEffect(() => {
    onPendingChange?.(isLoading);
  }, [isLoading, onPendingChange]);
  const computedDisabled = isLoading ? true : disabledProp;
  const visibleLabel = isLoading && loadingLabel != null ? loadingLabel : children;
  const isIconOnly =
    !isLoading &&
    startIcon == null &&
    endIcon == null &&
    !hasTextContent(visibleLabel);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!onClick || isLoading) return;
    if (Array.isArray(onClick)) {
      onClick.forEach((fn) => fn());
      return;
    }
    const result = onClick(event);
    if (!isThenable(result)) return;
    setPending(true);
    void Promise.resolve(result).finally(() => {
      setPending(false);
    });
  };

  const rootClassName = [classNames.root, className, active ? classNames.active : undefined]
    .filter(Boolean)
    .join(' ');

  const variantClass =
    uiStyles[`buttonVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];

  const sharedClassName = [
    uiStyles.buttonBase,
    variantClass,
    isLoading ? uiStyles.buttonPending : undefined,
    rootClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const labelContent =
    visibleLabel != null && visibleLabel !== false
      ? classNames.text
        ? (
            <span className={classNames.text}>{visibleLabel}</span>
          )
        : visibleLabel
      : null;

  const inner = (
    <>
      {startIcon && !isLoading ? (
        <span className={classNames.startIcon} aria-hidden>
          {startIcon}
        </span>
      ) : null}
      {isLoading ? (
        <span className={uiStyles.buttonLoadingWrap} role="status">
          <span className={uiStyles.buttonLoader} aria-hidden />
          {labelContent}
        </span>
      ) : (
        labelContent
      )}
      {endIcon && !isLoading ? (
        <span className={classNames.endIcon} aria-hidden>
          {endIcon}
        </span>
      ) : null}
    </>
  );

  if (href && !computedDisabled) {
    return (
      <Link
        href={href}
        data-variant={variant}
        data-active={active ? 'true' : 'false'}
        className={sharedClassName}
        style={style}
        aria-label={ariaLabel}
        onClick={(event) => {
          if (isLoading) event.preventDefault();
          if (!onClick || isLoading) return;
          if (Array.isArray(onClick)) {
            onClick.forEach((fn) => fn());
            return;
          }
          onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-active={active ? 'true' : 'false'}
      data-loading={isLoading ? 'true' : 'false'}
      data-icon-only={isIconOnly ? 'true' : undefined}
      className={sharedClassName}
      style={style}
      onClick={handleClick}
      disabled={computedDisabled}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? loadingAriaLabel ?? loadingLabel?.toString() : ariaLabel}
      {...props}
    >
      {inner}
    </button>
  );
});

Button.displayName = 'Button';
