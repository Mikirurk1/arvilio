import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';
import { Badge, type BadgeVariant } from './Badge';
import uiStyles from './ui.module.scss';

export type FeatureCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tag?: ReactNode;
  tagVariant?: BadgeVariant;
  cta?: ReactNode;
  href?: string;
  disabled?: boolean;
  className?: string;
  bodyClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
} & HTMLAttributes<HTMLElement>;

export function FeatureCard({
  title,
  description,
  icon,
  tag,
  tagVariant = 'neutral',
  cta,
  href,
  disabled = false,
  className,
  bodyClassName,
  iconClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
  ...props
}: FeatureCardProps) {
  const cardClassName = [uiStyles.featureCard, disabled ? uiStyles.featureCardDisabled : '', className]
    .filter(Boolean)
    .join(' ');

  const body = (
    <div className={[uiStyles.featureCardBody, bodyClassName].filter(Boolean).join(' ')}>
      {icon ? <div className={[uiStyles.featureCardIcon, iconClassName].filter(Boolean).join(' ')}>{icon}</div> : null}
      <h3 className={[uiStyles.featureCardTitle, titleClassName].filter(Boolean).join(' ')}>{title}</h3>
      {description ? (
        <p className={[uiStyles.featureCardDescription, descriptionClassName].filter(Boolean).join(' ')}>
          {description}
        </p>
      ) : null}
      {(tag || cta) ? (
        <div className={[uiStyles.featureCardFooter, footerClassName].filter(Boolean).join(' ')}>
          {tag ? <Badge variant={tagVariant}>{tag}</Badge> : <span />}
          {cta ? <span>{cta}</span> : null}
        </div>
      ) : null}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={cardClassName}>
        {body}
      </Link>
    );
  }

  return (
    <article className={cardClassName} {...props}>
      {body}
    </article>
  );
}
