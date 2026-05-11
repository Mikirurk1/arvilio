import type { ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type ActionRowProps = {
  title: ReactNode;
  description?: ReactNode;
  action: ReactNode;
  className?: string;
  infoClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
};

export function ActionRow({
  title,
  description,
  action,
  className,
  infoClassName,
  titleClassName,
  descriptionClassName,
  actionClassName,
}: ActionRowProps) {
  return (
    <div className={[uiStyles.actionRow, className].filter(Boolean).join(' ')}>
      <div className={[uiStyles.actionRowInfo, infoClassName].filter(Boolean).join(' ')}>
        <div className={[uiStyles.actionRowTitle, titleClassName].filter(Boolean).join(' ')}>{title}</div>
        {description ? (
          <div className={[uiStyles.actionRowDescription, descriptionClassName].filter(Boolean).join(' ')}>
            {description}
          </div>
        ) : null}
      </div>
      <div className={[uiStyles.actionRowAction, actionClassName].filter(Boolean).join(' ')}>{action}</div>
    </div>
  );
}
