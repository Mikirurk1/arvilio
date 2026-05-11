import type { ReactNode } from 'react';

export type ProfileHeroStat = {
  value: ReactNode;
  label: ReactNode;
};

export type ProfileHeroProps = {
  avatar: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  stats: ProfileHeroStat[];
  className?: string;
  avatarClassName?: string;
  infoClassName?: string;
  nameClassName?: string;
  metaClassName?: string;
  badgesClassName?: string;
  statsClassName?: string;
  statClassName?: string;
  statValueClassName?: string;
  statLabelClassName?: string;
};

export function ProfileHero({
  avatar,
  name,
  meta,
  badges,
  stats,
  className,
  avatarClassName,
  infoClassName,
  nameClassName,
  metaClassName,
  badgesClassName,
  statsClassName,
  statClassName,
  statValueClassName,
  statLabelClassName,
}: ProfileHeroProps) {
  return (
    <div className={className}>
      <div className={avatarClassName}>{avatar}</div>
      <div className={infoClassName}>
        <div className={nameClassName}>{name}</div>
        {meta ? <div className={metaClassName}>{meta}</div> : null}
        {badges ? <div className={badgesClassName}>{badges}</div> : null}
      </div>
      <div className={statsClassName}>
        {stats.map((stat, index) => (
          <div key={index} className={statClassName}>
            <span className={statValueClassName}>{stat.value}</span>
            <span className={statLabelClassName}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
