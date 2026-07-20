import { fireEvent, render, screen, within } from '@testing-library/react';
import { Field } from './Field';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

describe('Field', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('renders input with id', () => {
    render(<Field label="Email" id="email" value="" onChange={() => {}} />);
    expect(document.getElementById('email')).toBeInTheDocument();
  });

  it('toggles password visibility from the inline action', () => {
    render(<Field id="password" type="password" value="secret123" onChange={() => {}} />);

    const input = document.getElementById('password') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);
    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('shows error text', () => {
    render(
      <Field label="Name" id="name" value="" onChange={() => {}} error="Required" />,
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows hint when there is no error', () => {
    render(
      <Field label="Name" id="name" value="" onChange={() => {}} hint="Optional" />,
    );
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('readOnly input renders formatted value', () => {
    render(
      <Field
        id="name"
        readOnly
        value="Jane"
        formatValue={(value) => `User: ${String(value)}`}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('User: Jane')).toBeInTheDocument();
  });

  it('readOnly checkbox renders Yes/No', () => {
    const { rerender } = render(
      <Field as="checkbox" id="agree" readOnly checked onChange={() => {}} />,
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    rerender(<Field as="checkbox" id="agree" readOnly checked={false} onChange={() => {}} />);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('readOnly select shows selected option label', () => {
    render(
      <Field as="select" id="level" readOnly value="b1" onChange={() => {}}>
        <option value="a1">A1</option>
        <option value="b1">B1</option>
      </Field>,
    );
    expect(screen.getByText('B1')).toBeInTheDocument();
  });

  it('textarea renders with error and hint', () => {
    render(
      <Field as="textarea" id="notes" value="Hello" onChange={() => {}} error="Too short" />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('checkbox input toggles via change handler', () => {
    const onChange = jest.fn();
    render(
      <Field as="checkbox" id="agree" label="I agree" checked={false} onChange={onChange} />,
    );
    expect(screen.getByText('I agree')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('radio input selects via change handler', () => {
    const onChange = jest.fn();
    render(
      <Field
        as="radio"
        id="plan-pro"
        name="plan"
        label="Pro"
        checked={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Pro')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio'));
    expect(onChange).toHaveBeenCalled();
  });

  it('select on desktop opens custom listbox and selects option', () => {
    const onChange = jest.fn();
    render(
      <Field as="select" id="level" value="a1" onChange={onChange}>
        <option value="a1">A1</option>
        <option value="b1">B1</option>
      </Field>,
    );

    fireEvent.click(document.getElementById('level')!);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('button', { name: 'B1' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'b1' }),
      }),
    );
  });

  it('select on mobile renders native select', () => {
    mockMatchMedia(true);
    render(
      <Field as="select" id="level" value="a1" onChange={() => {}}>
        <option value="a1">A1</option>
        <option value="b1">B1</option>
      </Field>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('advancedSelect filters options locally and selects value', () => {
    const onChange = jest.fn();
    render(
      <Field
        as="advancedSelect"
        id="student"
        value="b1"
        onChange={onChange}
        options={[
          { value: 'a1', label: 'Anna' },
          { value: 'b1', label: 'Boris' },
          { value: 'c1', label: 'Chris' },
        ]}
      />,
    );

    fireEvent.click(document.getElementById('student')!);
    const search = screen.getByPlaceholderText('Search…');
    fireEvent.change(search, { target: { value: 'bor' } });
    expect(screen.queryByRole('option', { name: 'Anna' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'b1' }),
      }),
    );
  });

  it('advancedSelect calls onSearch when query changes', () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    render(
      <Field
        as="advancedSelect"
        id="student-remote"
        value=""
        onChange={() => {}}
        onSearch={onSearch}
        options={[{ value: 'a1', label: 'Anna' }]}
      />,
    );

    fireEvent.click(document.getElementById('student-remote')!);
    fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: 'an' } });
    jest.advanceTimersByTime(250);
    expect(onSearch).toHaveBeenCalledWith('an');
    jest.useRealTimers();
  });

  it('file-button triggers hidden input click', () => {
    const onFilesSelected = jest.fn();
    render(
      <Field
        as="file-button"
        id="files"
        buttonLabel="Upload"
        onFilesSelected={onFilesSelected}
      />,
    );
    const input = document.getElementById('files') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('tel input applies mask on change', () => {
    const onChange = jest.fn();
    render(<Field id="phone" type="tel" onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0501234567' } });
    expect(onChange).toHaveBeenCalled();
    expect(input.value).toMatch(/^\+/);
  });

  it('readOnly textarea renders block element', () => {
    render(
      <Field as="textarea" id="bio" readOnly value="Long bio" onChange={() => {}} />,
    );
    expect(screen.getByText('Long bio').tagName).toBe('DIV');
  });
});
