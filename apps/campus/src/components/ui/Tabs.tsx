import type { ReactNode } from 'react';
import { Button } from './Button';
import uiStyles from './ui.module.scss';

export type TabsItem<T extends string> = {
  value: T;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
};

export type TabsProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  items: ReadonlyArray<TabsItem<T>>;
  ariaLabel: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  activeTriggerClassName?: string;
  panelClassName?: string;
  /**
   * When true, render all tab panels (hidden when inactive) so panels don't unmount/remount
   * while switching tabs. Useful when tab content has expensive mount effects.
   */
  keepMounted?: boolean;
};

export function Tabs<T extends string>({
  value,
  onValueChange,
  items,
  ariaLabel,
  className,
  listClassName,
  triggerClassName,
  activeTriggerClassName,
  panelClassName,
  keepMounted = false,
}: TabsProps<T>) {
  const activeItem = items.find((item) => item.value === value) ?? items[0];
  const useCustomListStyles = Boolean(listClassName);
  const useCustomTriggerStyles = Boolean(triggerClassName);
  const useCustomActiveStyles = Boolean(activeTriggerClassName);

  return (
    <div className={[uiStyles.tabsRoot, className].filter(Boolean).join(' ')}>
      <div
        className={[useCustomListStyles ? '' : uiStyles.tabsList, listClassName].filter(Boolean).join(' ')}
        role="tablist"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant="ghost"
            role="tab"
            aria-selected={item.value === activeItem?.value}
            aria-controls={`panel-${item.value}`}
            id={`tab-${item.value}`}
            disabled={item.disabled}
            className={[
              useCustomTriggerStyles ? '' : uiStyles.tabsTrigger,
              triggerClassName,
              item.value === activeItem?.value
                ? [
                    useCustomActiveStyles ? '' : uiStyles.tabsTriggerActive,
                    activeTriggerClassName,
                  ]
                    .filter(Boolean)
                    .join(' ')
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onValueChange(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {keepMounted
        ? items.map((item) => {
            const isActive = item.value === activeItem?.value;
            return (
              <div
                key={item.value}
                role="tabpanel"
                id={`panel-${item.value}`}
                aria-labelledby={`tab-${item.value}`}
                hidden={!isActive}
                className={[uiStyles.tabsPanel, panelClassName].filter(Boolean).join(' ')}
              >
                {item.panel}
              </div>
            );
          })
        : activeItem
          ? (
              <div
                role="tabpanel"
                id={`panel-${activeItem.value}`}
                aria-labelledby={`tab-${activeItem.value}`}
                className={[uiStyles.tabsPanel, panelClassName].filter(Boolean).join(' ')}
              >
                {activeItem.panel}
              </div>
            )
          : null}
    </div>
  );
}
