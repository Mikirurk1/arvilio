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
import { formatDateLabel, formatTimeLabel } from '../../lib/date-picker-utils';
import { formatTelMask } from '../../lib/tel-mask';
import { stripNativeValidationProps } from '../../lib/strip-native-validation';
import { findSelectOption, parseSelectOptionChildren } from './advanced-select-options';
import type { AdvancedSelectOption } from './advanced-select-options';
import { Button } from './Button';
import { AdvancedSelectControl } from './AdvancedSelectControl';
import { DatePickerControl } from './DatePickerControl';
import { TimePickerControl } from './TimePickerControl';
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
  /** Extra class on the label + control wrapper (`.fieldRoot`). */
  rootClassName?: string;
  /** Extra class on the `<label>`. */
  labelClassName?: string;
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

export type FieldAdvancedSelectProps = SharedProps & {
  as: 'advancedSelect';
  options?: AdvancedSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  searchDebounceMs?: number;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple'>;

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
  | FieldAdvancedSelectProps
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

function mergeSelectControlClass(className?: string): string | undefined {
  return [uiStyles.fieldControl, className].filter(Boolean).join(' ') || undefined;
}

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

function FieldShell({
  label,
  hint,
  error,
  id,
  errorId,
  hintId,
  rootClassName,
  labelClassName,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  id: string;
  errorId: string;
  hintId: string;
  rootClassName?: string;
  labelClassName?: string;
  children: React.ReactNode;
}) {
  if (!label && !hint && !error) return <>{children}</>;
  const rootClass = [uiStyles.fieldRoot, rootClassName].filter(Boolean).join(' ') || undefined;
  const labelClass = [uiStyles.fieldLabel, labelClassName].filter(Boolean).join(' ') || undefined;
  return (
    <div className={rootClass}>
      {label ? (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <small id={errorId} className={uiStyles.fieldError} role="alert">
          {error}
        </small>
      ) : null}
      {hint && !error ? (
        <small id={hintId} className={uiStyles.fieldHint}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const fieldShellLayout = {
    rootClassName: props.rootClassName,
    labelClassName: props.labelClassName,
  };

  const resolveReadonlyValue = (): React.ReactNode => {
    if (props.as === 'checkbox') {
      const checked = Boolean(props.checked);
      return props.formatValue ? props.formatValue(checked) : checked ? 'Yes' : 'No';
    }

    if (props.as === 'select' || props.as === 'advancedSelect') {
      const options =
        props.as === 'advancedSelect' && props.options?.length
          ? props.options
          : parseSelectOptionChildren(props.children);
      const selected = findSelectOption(options, String(props.value ?? ''));
      const selectedLabel = selected?.label ?? props.value;
      return props.formatValue ? props.formatValue(selectedLabel) : (selectedLabel ?? '—');
    }

    if (props.as === 'file-button') {
      return props.formatValue ? props.formatValue('') : '—';
    }

    const rawValue = (props as FieldInputProps | FieldTextareaProps).value;
    if (props.formatValue) return props.formatValue(rawValue);
    if (rawValue === undefined || rawValue === null || rawValue === '') return '—';
    const inputType = (props as FieldInputProps).type;
    if (inputType === 'date') return formatDateLabel(String(rawValue), '—');
    if (inputType === 'time') return formatTimeLabel(String(rawValue), '—');
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
    const { as, label, hint, error, id: _id, formatValue: _formatValue, className, ...t } = props;
    void as;
    void _id;
    void _formatValue;
    const controlProps = stripNativeValidationProps(t);
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        id={id}
        errorId={errorId}
        hintId={hintId}
        {...fieldShellLayout}
      >
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          id={id}
          className={[uiStyles.fieldControl, className].filter(Boolean).join(' ') || undefined}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          {...controlProps}
        />
      </FieldShell>
    );
  }

  if (props.as === 'advancedSelect') {
    const {
      as,
      children,
      label,
      hint,
      error,
      id: _id,
      formatValue: _formatValue,
      options,
      placeholder,
      searchPlaceholder,
      onSearch,
      onLoadMore,
      hasMore,
      loadingMore,
      loading,
      emptyMessage,
      searchDebounceMs,
      ...s
    } = props;
    void as;
    void _id;
    void _formatValue;
    const controlProps = stripNativeValidationProps(s);
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        id={id}
        errorId={errorId}
        hintId={hintId}
        {...fieldShellLayout}
      >
        <AdvancedSelectControl
          ref={ref as React.ForwardedRef<HTMLSelectElement>}
          id={id}
          describedBy={describedBy}
          error={error}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loading={loading}
          emptyMessage={emptyMessage}
          searchDebounceMs={searchDebounceMs}
          {...controlProps}
          value={controlProps.value != null ? String(controlProps.value) : undefined}
          className={mergeSelectControlClass(controlProps.className)}
        >
          {children}
        </AdvancedSelectControl>
      </FieldShell>
    );
  }

  if (props.as === 'select') {
    const { as, children, label, hint, error, id: _id, formatValue: _formatValue, ...s } = props;
    void as;
    void _id;
    void _formatValue;
    const controlProps = stripNativeValidationProps(s);
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        id={id}
        errorId={errorId}
        hintId={hintId}
        {...fieldShellLayout}
      >
        <SelectControl
          ref={ref as React.ForwardedRef<HTMLSelectElement>}
          id={id}
          describedBy={describedBy}
          error={error}
          hint={hint}
          errorId={errorId}
          hintId={hintId}
          {...controlProps}
          className={mergeSelectControlClass(controlProps.className)}
        >
          {children}
        </SelectControl>
      </FieldShell>
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
    const controlProps = stripNativeValidationProps(c);
    return (
      <>
        <input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={id}
          type="checkbox"
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          {...controlProps}
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
    const controlProps = stripNativeValidationProps(f);
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
          {...controlProps}
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

  const dateMin = (i as FieldInputProps).min;
  const dateMax = (i as FieldInputProps).max;
  const controlProps = stripNativeValidationProps(i);
  const isDateInput = controlProps.type === 'date';
  const isTimeInput = controlProps.type === 'time';
  const toDateAttr = (value: string | number | undefined) =>
    value === undefined || value === '' ? undefined : String(value);
  const isTelInput = controlProps.type === 'tel';
  const isPasswordInput = controlProps.type === 'password';

  if (isDateInput) {
    const { type: _type, ...dateProps } = controlProps;
    void _type;
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        id={id}
        errorId={errorId}
        hintId={hintId}
        {...fieldShellLayout}
      >
        <DatePickerControl
          id={id}
          value={String(dateProps.value ?? '')}
          onChange={dateProps.onChange}
          disabled={dateProps.disabled}
          className={dateProps.className}
          min={toDateAttr(dateMin)}
          max={toDateAttr(dateMax)}
          placeholder={dateProps.placeholder}
          aria-describedby={describedBy}
          aria-invalid={props.error ? true : undefined}
        />
      </FieldShell>
    );
  }

  if (isTimeInput) {
    const { type: _type, ...timeProps } = controlProps;
    void _type;
    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        id={id}
        errorId={errorId}
        hintId={hintId}
        {...fieldShellLayout}
      >
        <TimePickerControl
          id={id}
          value={String(timeProps.value ?? '')}
          onChange={timeProps.onChange}
          disabled={timeProps.disabled}
          className={timeProps.className}
          placeholder={timeProps.placeholder}
          aria-describedby={describedBy}
          aria-invalid={props.error ? true : undefined}
        />
      </FieldShell>
    );
  }
  const telOnChange = isTelInput
    ? (event: ChangeEvent<HTMLInputElement>) => {
        const masked = formatTelMask(event.target.value);
        if (masked !== event.target.value) {
          event.target.value = masked;
        }
        controlProps.onChange?.(event);
      }
    : controlProps.onChange;
  const inputType = isTelInput ? 'tel' : isPasswordInput && showPassword ? 'text' : controlProps.type;
  // range/color — нативні типи зі своїм виглядом: текстовий .fieldControl їм не пасує
  const isRangeInput = controlProps.type === 'range';
  const isColorInput = controlProps.type === 'color';
  const baseControlClass = isRangeInput
    ? uiStyles.fieldRange
    : isColorInput
      ? uiStyles.fieldColor
      : uiStyles.fieldControl;
  const inputClassName = [
    baseControlClass,
    controlProps.className,
    isPasswordInput ? uiStyles.passwordToggleInput : '',
  ]
    .filter(Boolean)
    .join(' ');
  const inputControl = (
    <input
      ref={ref as React.ForwardedRef<HTMLInputElement>}
      id={id}
      aria-invalid={props.error ? true : undefined}
      aria-describedby={describedBy}
      {...controlProps}
      className={inputClassName || undefined}
      type={inputType}
      inputMode={isTelInput ? 'tel' : controlProps.inputMode}
      autoComplete={isTelInput ? (controlProps.autoComplete ?? 'tel') : controlProps.autoComplete}
      onChange={telOnChange}
    />
  );

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      id={id}
      errorId={errorId}
      hintId={hintId}
      {...fieldShellLayout}
    >
      {isPasswordInput ? (
        <div className={uiStyles.passwordToggleWrap}>
          {inputControl}
          <button
            type="button"
            className={uiStyles.passwordToggleButton}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            disabled={Boolean(controlProps.disabled)}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        </div>
      ) : (
        inputControl
      )}
    </FieldShell>
  );
});

Field.displayName = 'Field';
