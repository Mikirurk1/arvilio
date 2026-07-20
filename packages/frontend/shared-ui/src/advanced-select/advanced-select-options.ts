import { Children, isValidElement, type ReactNode } from 'react';

export type AdvancedSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  searchText?: string;
};

export function parseSelectOptionChildren(children: ReactNode): AdvancedSelectOption[] {
  return Children.toArray(children)
    .filter((child): child is React.ReactElement<{ value?: unknown; children?: ReactNode; disabled?: boolean }> => {
      if (!isValidElement(child)) return false;
      return child.type === 'option';
    })
    .map((option, index) => ({
      key: `${String(option.props.value ?? '')}::${index}`,
      value: String(option.props.value ?? ''),
      label: option.props.children,
      disabled: Boolean(option.props.disabled),
      searchText: undefined,
    }))
    .map(({ key: _key, ...rest }) => rest);
}

export function optionMatchesQuery(option: AdvancedSelectOption, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const labelText =
    typeof option.label === 'string' || typeof option.label === 'number'
      ? String(option.label)
      : '';
  const haystack = `${labelText} ${option.searchText ?? ''} ${option.value}`.toLowerCase();
  return haystack.includes(normalized);
}

export function findSelectOption(
  options: AdvancedSelectOption[],
  value: string | undefined,
): AdvancedSelectOption | undefined {
  if (value === undefined) return undefined;
  return options.find((option) => option.value === String(value));
}
