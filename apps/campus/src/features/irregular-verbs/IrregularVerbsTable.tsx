'use client';

import type { IrregularVerbEntry } from '@pkg/types';
import { useCampusT } from '../../lib/cms';
import styles from './IrregularVerbs.module.scss';

type Props = {
  verbs: readonly IrregularVerbEntry[];
};

export function IrregularVerbsTable({ verbs }: Props) {
  const t = useCampusT();
  const colBase = t('irregular.col.base');
  const colPastSimple = t('irregular.col.pastSimple');
  const colPastParticiple = t('irregular.col.pastParticiple');

  if (verbs.length === 0) {
    return <p className={styles.emptyTable}>{t('irregular.empty.search')}</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">{colBase}</th>
            <th scope="col">{colPastSimple}</th>
            <th scope="col">{colPastParticiple}</th>
          </tr>
        </thead>
        <tbody>
          {verbs.map((verb) => (
            <tr key={verb.base}>
              <td data-label={colBase}>
                <span className={styles.baseCell}>{verb.base}</span>
              </td>
              <td data-label={colPastSimple}>{verb.pastSimple}</td>
              <td data-label={colPastParticiple}>{verb.pastParticiple}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
