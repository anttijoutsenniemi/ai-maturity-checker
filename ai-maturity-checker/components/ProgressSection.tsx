'use client';

import styles from '@/styles/Progress.module.css';
import classNames from 'classnames';

type ProgressData = {
  dimension: string;
  total: number;
  answeredYes: number;
  answeredCount: number;
  percent: number;
};

export default function ProgressSection({ progressData = [] }: { progressData: ProgressData[] }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Progress in answering questions</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Answered yes</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {progressData?.map(({ dimension, total, answeredYes, percent }) => (
            <tr key={dimension}>
              <td className={styles.dimension}>{dimension}</td>
              <td>{answeredYes} / {total}</td>
              <td>
                <div className={styles.progressBarWrapper}>
                  <div
                    className={classNames(styles.progressBarFill, {
                      [styles.complete]: percent === 100,
                    })}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className={styles.percentText}>{percent}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
