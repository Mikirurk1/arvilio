'use client';

import { Eye, EyeOff } from 'lucide-react';
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ChangeEvent,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { MOBILE_MAX_WIDTH } from '../../lib/breakpoints';
import { formatTelMask } from '../../lib/tel-mask';
import { Button } from './Button';
import uiStyles from './ui.module.scss';

type SharedProps = {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  /**
   * Text mode: render plain text instead of form control.
   * Useful to avoid conditional rendering in parent components.
   */
  readOnly?: boolean;
  /**
   * Optional formatter for read-only text mode.
   */
  formatValue?: (value: unknown) => React.ReactNode;
};

type FieldInputProps = SharedProps & {
  as?: 'input' | undefined;
} & InputHTMLAttributes<HTMLInputElement>;

type FieldTextareaProps = SharedProps & {
  as: 'textarea';
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export type FieldSelectProps = SharedProps & {
  as: 'select';
} & SelectHTMLAttributes<HTMLSelectElement>;

type FieldCheckboxProps = SharedProps & {
  as: 'checkbox';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

type FieldFileButtonProps = SharedProps & {
  as: 'file-button';
  buttonLabel?: string;
  onFilesSelected?: (files: FileList | null) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'>;

export type FieldProps =
  | FieldInputProps
  | FieldTextareaProps
  | FieldSelectProps
  | FieldCheckboxProps
  | FieldFileButtonProps;

type SelectControlProps = {
  id: string;
  describedBy?: string;
  error?: string;
  hint?: string;
  errorId: string;
  hintId: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

const SelectControl = forwardRef<HTMLSelectElement, SelectControlProps>(function SelectControl(
  {
    children,
    className,
    value,
    onChange,
    disabled,
    id,
    describedBy,
    error,
    hint,
    errorId,
    hintId,
    ...rest
  },
  ref,
) {
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
    const media = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
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

  const footer = (
    <>
      {error ? <small id={errorId}>{error}</small> : null}
      {hint && !error ? <small id={hintId}>{hint}</small> : null}
    </>
  );

  if (isMobile) {
    return (
      <>
        <select
          ref={ref}
          id={id}
          className={className}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {children}
        </select>
        {footer}
      </>
    );
  }

  return (
    <>
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
          aria-controls={`${id}-listbox`}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
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
          <div id={`${id}-listbox`} role="listbox" className={uiStyles.adaptiveSelectMenu}>
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
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          {...rest}
          style={{ display: 'none' }}
        >
          {children}
        </select>
      </div>
      {footer}
    </>
  );
});

SelectControl.displayName = 'SelectControl';

export const Field = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FieldProps
>(function Field(props, ref) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [props.error ? errorId : '', props.hint && !props.error ? hintId : '']
    .filter(Boolean)
    .join(' ') || undefined;
  const isTextMode = Boolean(props.readOnly);

  const resolveReadonlyValue = (): React.ReactNode => {
    if (props.as === 'checkbox') {
      const checked = Boolean(props.checked);
      return props.formatValue ? props.formatValue(checked) : checked ? 'Yes' : 'No';
    }

    if (props.as === 'select') {
      const selected = Children.toArray(props.children).find((child) => {
        if (!isValidElement(child)) return false;
        if (child.type !== 'option') return false;
        return String((child.props as { value?: unknown }).value ?? '') === String(props.value ?? '');
      });
      const selectedLabel = isValidElement<{ children?: React.ReactNode }>(selected)
        ? selected.props.children
        : props.value;
      return props.formatValue ? props.formatValue(selectedLabel) : (selectedLabel ?? '—');
    }

    if (props.as === 'file-button') {
      return props.formatValue ? props.formatValue('') : '—';
    }

    const rawValue = (props as FieldInputProps | FieldTextareaProps).value;
    if (props.formatValue) return props.formatValue(rawValue);
    if (rawValue === undefined || rawValue === null || rawValue === '') return '—';
    return String(rawValue);
  };

  if (isTextMode) {
    const textValue = resolveReadonlyValue();
    const asTextBlock = props.as === 'textarea';
    const className = 'className' in props ? props.className : undefined;
    return asTextBlock ? (
      <div className={className}>{textValue}</div>
    ) : (
      <span className={className}>{textValue}</span>
    );
  }

  if (props.as === 'textarea') {
    const { as, label, hint, error, id: _id, formatValue: _formatValue, ...t } = props;
    void as;
    void label;
    void hint;
    void error;
    void _id;
    void _formatValue;
    return (
      <>
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          id={id}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          {...t}
        />
        {props.error ? <small id={errorId}>{props.error}</small> : null}
        {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
      </>
    );
  }

  if (props.as === 'select') {
    const { as, children, label, hint, error, id: _id, formatValue: _formatValue, ...s } = props;
    void as;
    void label;
    void _id;
    void _formatValue;
    return (
      <SelectControl
        ref={ref as React.ForwardedRef<HTMLSelectElement>}
        id={id}
        describedBy={describedBy}
        error={error}
        hint={hint}
        errorId={errorId}
        hintId={hintId}
        {...s}
      >
        {children}
      </SelectControl>
    );
  }

  if (props.as === 'checkbox') {
    const { as, label, hint, error, id: _id, formatValue: _formatValue, ...c } = props;
    void as;
    void label;
    void hint;
    void error;
    void _id;
    void _formatValue;
    return (
      <>
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={id}
          type="checkbox"
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          {...c}
        />
        {props.error ? <small id={errorId}>{props.error}</small> : null}
        {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
      </>
    );
  }

  if (props.as === 'file-button') {
    const {
      as,
      buttonLabel = 'Choose files',
      onFilesSelected,
      className,
      label,
      hint,
      error,
      id: _id,
      formatValue: _formatValue,
      ...f
    } = props;
    void as;
    void label;
    void hint;
    void error;
    void _id;
    void _formatValue;
    return (
      <>
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={id}
          type="file"
          style={{ display: 'none' }}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            onFilesSelected?.(e.target.files);
            e.currentTarget.value = '';
          }}
          {...f}
        />
        <Button
          type="button"
          className={className}
          aria-controls={id}
          disabled={Boolean((f as InputHTMLAttributes<HTMLInputElement>).disabled)}
          onClick={(e) =>
            ((e.currentTarget.previousElementSibling as HTMLInputElement | null)?.click())
          }
        >
          <span>{buttonLabel}</span>
        </Button>
        {props.error ? <small id={errorId}>{props.error}</small> : null}
        {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
      </>
    );
  }

  const { as, label, hint, error, id: _id, formatValue: _formatValue, ...i } = props as FieldInputProps;
  void as;
  void label;
  void hint;
  void error;
  void _id;
  void _formatValue;

  const isTelInput = i.type === 'tel';
  const isPasswordInput = i.type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const telOnChange = isTelInput
    ? (event: ChangeEvent<HTMLInputElement>) => {
        const masked = formatTelMask(event.target.value);
        if (masked !== event.target.value) {
          event.target.value = masked;
        }
        i.onChange?.(event);
      }
    : i.onChange;
  const inputType = isTelInput ? 'tel' : isPasswordInput && showPassword ? 'text' : i.type;
  const inputClassName = [i.className, isPasswordInput ? uiStyles.passwordToggleInput : '']
    .filter(Boolean)
    .join(' ');
  const inputControl = (
    <input
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      id={id}
      aria-invalid={props.error ? true : undefined}
      aria-describedby={describedBy}
      {...i}
      className={inputClassName || undefined}
      type={inputType}
      inputMode={isTelInput ? 'tel' : i.inputMode}
      autoComplete={isTelInput ? (i.autoComplete ?? 'tel') : i.autoComplete}
      onChange={telOnChange}
    />
  );

  return (
    <>
      {isPasswordInput ? (
        <div className={uiStyles.passwordToggleWrap}>
          {inputControl}
          <button
            type="button"
            className={uiStyles.passwordToggleButton}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            disabled={Boolean(i.disabled)}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
      ) : (
        inputControl
      )}
      {props.error ? <small id={errorId}>{props.error}</small> : null}
      {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
    </>
  );
});

Field.displayName = 'Field';
