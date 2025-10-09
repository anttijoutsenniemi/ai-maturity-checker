'use client';

import styles from '@/styles/Recommendations.module.css';
import { useStepsProgress } from '@/hooks/useSteps2';

type CapabilityLevel = {
  cl_short: string;
  capability_level: string;
  dimension_id: string;
  question_ids: string[];
  actions: Record<string, string[]>;
  fair_services: { fair_services: string[] };
  level_actions: string[];
};

type Props = {
  email: string;
  gapLevels: CapabilityLevel[];
  desiredLevels: CapabilityLevel[];
};

export default function RecommendationsPage({ email, gapLevels, desiredLevels }: Props) {
  const { completedSteps, completeStep } = useStepsProgress(email);

  // Complete step 4 if not yet done
  if (typeof window !== 'undefined' && !completedSteps.includes(4)) {
    completeStep(4);
  }

  const renderTable = (levels: CapabilityLevel[]) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Capability Level</th>
          <th>Improvement Actions</th>
          <th>FAIR Services</th>
        </tr>
      </thead>
      <tbody>
        {levels.map((cl) => {
          const actionList = Object.values(cl.actions || {}).flat();
          return (
            <tr key={cl.cl_short}>
              <td>
                <strong>{cl.cl_short}</strong>
                <br />
                {cl.capability_level}
              </td>
              <td>
                {actionList.length > 0 ? (
                  <ul>
                    {actionList.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <em>No actions needed</em>
                )}
              </td>
              <td>
                {cl.fair_services?.fair_services?.length > 0 ? (
                  <ul>
                    {cl.fair_services.fair_services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className={styles.container}>
      <h1>4. Recommendations</h1>
      <h3>
        In this page you will get all the info on how to level up your company’s AI skills &
        adoption
      </h3>

      <section>
        <div className={styles.gapBox}>
          <h2>Gap Levels</h2>
        </div>
        {renderTable(gapLevels)}
      </section>

      <section>
        <div className={styles.desiredBox}>
          <h2>Desired Levels</h2>
        </div>
        {renderTable(desiredLevels)}
      </section>
    </div>
  );
}
