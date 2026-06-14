import { optionMatchesQuery, parseSelectOptionChildren } from './advanced-select-options';

describe('advanced-select-options', () => {
  it('parses option children', () => {
    const options = parseSelectOptionChildren([
      <option key="a1" value="a1">
        A1
      </option>,
      <option key="b1" value="b1">
        B1
      </option>,
    ]);
    expect(options).toEqual([
      { value: 'a1', label: 'A1', disabled: false, searchText: undefined },
      { value: 'b1', label: 'B1', disabled: false, searchText: undefined },
    ]);
  });

  it('filters options locally by label and searchText', () => {
    expect(
      optionMatchesQuery({ value: '1', label: 'Anna Smith', searchText: 'teacher anna' }, 'anna'),
    ).toBe(true);
    expect(optionMatchesQuery({ value: '2', label: 'Bob', searchText: 'teacher bob' }, 'anna')).toBe(
      false,
    );
  });
});
