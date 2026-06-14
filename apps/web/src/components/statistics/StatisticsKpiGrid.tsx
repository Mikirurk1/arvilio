'use client';

import { Fragment, useState } from 'react';
import { Info } from 'lucide-react';
import type { StatisticsDashboardViewModel } from '../../lib/map-statistics-dashboard';
import { KPI_TOOLTIPS } from '../../lib/map-statistics-dashboard';
import { Button, StatTile, Tooltip as AppTooltip } from '../ui';
import styles from './StatisticsDashboard.module.scss';

interface Props {
  kpisByCategory: StatisticsDashboardViewModel['kpisByCategory'];
  isProfile: boolean;
  /** When false, renders tiles without the kpiSection wrapper/header (used inside StatisticsSection). */
  withSectionHeaders?: boolean;
}

export function StatisticsKpiGrid({ kpisByCategory, isProfile, withSectionHeaders = true }: Props) {
  const [hoveredKpiId, setHoveredKpiId] = useState<string | null>(null);
  const [hoveredKpiEl, setHoveredKpiEl] = useState<HTMLElement | null>(null);

  function renderKpiTiles(
    items: StatisticsDashboardViewModel['kpis'],
  ) {
    return (
      <div
        className={[styles.kpiGrid, isProfile ? styles.kpiGridProfile : '']
          .filter(Boolean)
          .join(' ')}
      >
        {items.map((kpi) => (
          <div key={kpi.id} className={styles.kpiWrap}>
            <Button
              type="button"
              variant="ghost"
              className={styles.kpiInfoBtn}
              aria-label={`About ${kpi.label}`}
              onMouseEnter={(event) => {
                setHoveredKpiId(kpi.id);
                setHoveredKpiEl(event.currentTarget);
              }}
              onMouseLeave={() => {
                setHoveredKpiId(null);
                setHoveredKpiEl(null);
              }}
              onFocus={(event) => {
                setHoveredKpiId(kpi.id);
                setHoveredKpiEl(event.currentTarget);
              }}
              onBlur={() => {
                setHoveredKpiId(null);
                setHoveredKpiEl(null);
              }}
            >
              <Info size={14} />
            </Button>
            <StatTile
              label={kpi.label}
              value={kpi.value}
              subtext={kpi.deltaLabel}
              className={styles.kpiTile}
              subtextClassName={
                kpi.trend === 'up'
                  ? styles.kpiUp
                  : kpi.trend === 'down'
                    ? styles.kpiDown
                    : ''
              }
            />
            <AppTooltip
              open={hoveredKpiId === kpi.id}
              targetEl={hoveredKpiEl}
              placement="top"
              content={KPI_TOOLTIPS[kpi.id] ?? 'Statistics metric for selected period.'}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!withSectionHeaders) {
    return (
      <>
        {kpisByCategory.map((group) => (
          <Fragment key={group.category}>{renderKpiTiles(group.items)}</Fragment>
        ))}
      </>
    );
  }

  return (
    <div className={styles.kpiSections}>
      {kpisByCategory.map((group) => (
        <div key={group.category} className={styles.kpiSection}>
          <h3 className={styles.kpiSectionTitle}>{group.categoryLabel}</h3>
          {renderKpiTiles(group.items)}
        </div>
      ))}
    </div>
  );
}
