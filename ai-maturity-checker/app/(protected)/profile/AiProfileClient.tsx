"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import styles from "@/styles/Profile.module.css";
import levelStyles from "@/styles/ProfileLevels.module.css";
import { useStepsProgress } from "@/hooks/useSteps2";

type Topic = {
  id: number;
  title: string;
  dimension: string;
};

type CapabilityLevel = {
  cl_short: string;
  capability_level: string;
  question_ids: string[];
  dimension_id: string;
};

type Props = {
  email: string;
  topics: Topic[];
  capabilityLevels: CapabilityLevel[];
  currentLevels: string[];
  gapLevels: string[];
  priorityLevels: string[];
};

export default function AiProfileClient({
  email,
  topics,
  capabilityLevels,
  currentLevels,
  gapLevels,
  priorityLevels,
}: Props) {

  if(!email || !topics || !capabilityLevels || !currentLevels || !gapLevels || !priorityLevels){
    return <div>no props</div>
  }
  const [showCurrent, setShowCurrent] = useState(true);
  const [showGap, setShowGap] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const { completedSteps, completeStep } = useStepsProgress(email);

  useEffect(() => {
    if (!completedSteps.includes(3)) completeStep(3);
  }, [completedSteps, completeStep]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>3. Analysis & Planning</h1>

      {/* Toggle buttons */}
      <div className={styles.toggleRow}>
        <button
          className={clsx(styles.toggleButton, showCurrent && styles.toggleActiveGreen)}
          onClick={() => setShowCurrent(!showCurrent)}
        >
          1. Show current levels
        </button>
        <button
          className={clsx(styles.toggleButton, showGap && styles.toggleActiveLightBlue)}
          onClick={() => setShowGap(!showGap)}
        >
          2. Show gap levels
        </button>
        <button
          className={clsx(styles.toggleButton, showPriority && styles.toggleActiveDarkBlue)}
          onClick={() => setShowPriority(!showPriority)}
        >
          3. Show priority levels
        </button>
      </div>

      {/* Capability Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Dimension</th>
            <th>AI Capability Profile</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((dim, idx) => {
            const dimLevels = capabilityLevels.filter(
              (c) => c.dimension_id === dim.dimension
            );
            return (
              <tr key={dim.id}>
                <td>{idx + 1}</td>
                <td>{dim.title}</td>
                <td>
                  <div className={styles.levelRow}>
                    {dimLevels.map((lvl) => {
                      let colorClass = styles.levelUndefined;
                      if (showCurrent && currentLevels.includes(lvl.cl_short)) {
                        colorClass = styles.levelCurrent;
                      } else if (showPriority && priorityLevels.includes(lvl.cl_short)) {
                        colorClass = styles.levelPriority;
                      } else if (showGap && gapLevels.includes(lvl.cl_short)) {
                        colorClass = styles.levelGap;
                      }
                      return (
                        <div
                          key={lvl.cl_short}
                          className={clsx(styles.levelBlock, colorClass)}
                        >
                          {lvl.cl_short}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Boxes */}
      <div className={levelStyles.levelBox}>
        <div className={levelStyles.section}>
          <h3>1. Completed Levels</h3>
          {capabilityLevels
            .filter((cl) => currentLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>

        <div className={levelStyles.section}>
          <h3>2. Gap Levels</h3>
          {capabilityLevels
            .filter((cl) => gapLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>

        <div className={levelStyles.section}>
          <h3>3. Priority Levels</h3>
          {capabilityLevels
            .filter((cl) => priorityLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
