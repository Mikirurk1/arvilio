import type { VerbFormsDto } from '@pkg/types';
import { formatVerbFormsLine } from '../../lib/vocabulary-ui';
import styles from './VerbFormsLine.module.scss';

type Props = {
  verbForms: VerbFormsDto;
  className?: string;
};

export function VerbFormsLine({ verbForms, className }: Props) {
  return (
    <p className={className ? `${styles.line} ${className}` : styles.line}>
      {formatVerbFormsLine(verbForms)}
    </p>
  );
}
