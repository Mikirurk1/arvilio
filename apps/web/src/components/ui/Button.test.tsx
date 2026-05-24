import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders label text', () => {
    render(<Button type="button">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <Button type="button" disabled>
        Save
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('renders variant and active data attributes', () => {
    render(
      <Button variant="ghost" active>
        Active
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Active' });
    expect(btn).toHaveAttribute('data-variant', 'ghost');
    expect(btn).toHaveAttribute('data-active', 'true');
  });

  it('shows controlled loading state with loadingLabel', () => {
    render(
      <Button loading loadingLabel="Saving…" loadingAriaLabel="Saving">
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Saving' });
    expect(btn).toHaveAttribute('data-loading', 'true');
    expect(btn).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('calls onClick handlers from array', () => {
    const first = jest.fn();
    const second = jest.fn();
    render(<Button onClick={[first, second]}>Run</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it('enters pending state for async onClick and notifies onPendingChange', async () => {
    let resolveClick!: () => void;
    const onClick = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveClick = resolve;
        }),
    );
    const onPendingChange = jest.fn();
    render(
      <Button onClick={onClick} onPendingChange={onPendingChange}>
        Save
      </Button>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'true');
    expect(onPendingChange).toHaveBeenCalledWith(true);

    resolveClick();
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'false');
    });
    expect(onPendingChange).toHaveBeenCalledWith(false);
  });

  it('ignores click while loading', () => {
    const onClick = jest.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders start and end icons when not loading', () => {
    render(
      <Button startIcon={<span data-testid="start">+</span>} endIcon={<span data-testid="end">→</span>}>
        Next
      </Button>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('marks icon-only buttons without visible label', () => {
    render(
      <Button aria-label="Delete">
        <svg aria-hidden />
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-icon-only', 'true');
  });

  it('calls sync onClick handler without pending state', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('data-loading', 'false');
  });

  it('wraps label with classNames.text when provided', () => {
    render(
      <Button classNames={{ text: 'label-class' }}>Label</Button>,
    );
    expect(screen.getByText('Label')).toHaveClass('label-class');
  });
});
