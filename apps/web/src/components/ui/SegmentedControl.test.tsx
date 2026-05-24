import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  it('calls onValueChange when option clicked', () => {
    const onValueChange = jest.fn();
    render(
      <SegmentedControl
        value="a"
        onValueChange={onValueChange}
        ariaLabel="Mode"
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});
