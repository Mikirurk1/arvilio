'use client';

import type { IrregularVerbEntry } from '@pkg/types';
import styles from './IrregularVerbs.module.scss';

type Props = {
  verbs: readonly IrregularVerbEntry[];
};

export function IrregularVerbsTable({ verbs }: Props) {
  if (verbs.length === 0) {
    return <p className={styles.emptyTable}>No verbs match your search.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Base form</th>
            <th scope="col">Past simple</th>
            <th scope="col">Past participle</th>
          </tr>
        </thead>
        <tbody>
          {verbs.map((verb) => (
            <tr key={verb.base}>
              <td data-label="Base form">
                <span className={styles.baseCell}>{verb.base}</span>
              </td>
              <td data-label="Past simple">{verb.pastSimple}</td>
              <td data-label="Past participle">{verb.pastParticiple}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
