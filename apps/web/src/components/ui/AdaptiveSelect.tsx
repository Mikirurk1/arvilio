'use client';

import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import type { SelectHTMLAttributes } from 'react';
import uiStyles from './ui.module.scss';

type AdaptiveSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  readOnly?: boolean;
  formatValue?: (value: unknown) => React.ReactNode;
};

export function AdaptiveSelect({
  children,
  className,
  value,
  onChange,
  disabled,
  readOnly,
  formatValue,
  ...rest
}: AdaptiveSelectProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((child): child is React.ReactElement<{ value?: unknown; children?: React.ReactNode }> => {
          if (!isValidElement(child)) return false;
          return child.type === 'option';
        })
        .map((option, index) => ({
          key: `${String(option.props.value ?? '')}::${index}`,
          value: String(option.props.value ?? ''),
          label: option.props.children,
          disabled: Boolean((option.props as { disabled?: boolean }).disabled),
        })),
    [children],
  );

  const selectedValue = String(value ?? '');
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (readOnly) {
    const out = formatValue ? formatValue(selectedOption?.label ?? value) : (selectedOption?.label ?? value ?? '—');
    return <span className={className}>{out}</span>;
  }

  if (isMobile) {
    return (
      <select className={className} value={value} onChange={onChange} disabled={disabled} {...rest}>
        {children}
      </select>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={[uiStyles.adaptiveSelectWrap, open ? uiStyles.adaptiveSelectWrapOpen : '']
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={[
          className,
          uiStyles.adaptiveSelectTrigger,
          open ? uiStyles.adaptiveSelectTriggerOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={uiStyles.adaptiveSelectValue}>{selectedOption?.label ?? '—'}</span>
        <span className={uiStyles.adaptiveSelectChevron} aria-hidden>
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open ? (
        <div role="listbox" className={uiStyles.adaptiveSelectMenu}>
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={option.disabled}
              className={[
                uiStyles.adaptiveSelectItem,
                option.value === selectedValue ? uiStyles.adaptiveSelectItemActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (option.disabled) return;
                onChange?.({
                  target: { value: option.value },
                  currentTarget: { value: option.value },
                } as unknown as React.ChangeEvent<HTMLSelectElement>);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      <select value={value} onChange={onChange} disabled={disabled} {...rest} style={{ display: 'none' }}>
        {children}
      </select>
    </div>
  );
}
