import { Children, forwardRef, isValidElement, useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Button } from './Button';

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

type FieldSelectProps = SharedProps & {
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
    void hint;
    void error;
    void _id;
    void _formatValue;
    return (
      <>
        <select
          ref={ref as React.ForwardedRef<HTMLSelectElement>}
          id={id}
          aria-invalid={props.error ? true : undefined}
          aria-describedby={describedBy}
          {...s}
        >
          {children}
        </select>
        {props.error ? <small id={errorId}>{props.error}</small> : null}
        {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
      </>
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
  return (
    <>
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        id={id}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy}
        {...i}
      />
      {props.error ? <small id={errorId}>{props.error}</small> : null}
      {props.hint && !props.error ? <small id={hintId}>{props.hint}</small> : null}
    </>
  );
});

Field.displayName = 'Field';
