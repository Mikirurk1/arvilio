import { Children, type ReactNode } from 'react';
import styles from './ui.module.scss';

export type DataTableProps = {
  headers: ReactNode[];
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
};

export function DataTable({ headers, children, empty = 'No rows.', className }: DataTableProps) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <div className={[styles.tableWrap, className].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i} className={styles.th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={headers.length}>
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  muted,
  className,
}: {
  children?: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <td className={[styles.td, muted ? styles.tdMuted : '', className].filter(Boolean).join(' ')}>
      {children}
    </td>
  );
}
