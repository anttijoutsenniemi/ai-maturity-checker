"use client";

import { CheckCircle, Circle } from "lucide-react";
import styles from '@/styles/frontpage.module.css';
import Link from "next/link";
import { stepsConfig } from "@/config/stepsConfig";
import { useStepsProgress } from "@/hooks/useSteps2";
import { useDimensionsProgress } from "@/hooks/useDimensions";
import { useEffect } from "react";

export default function HomePage() {
  const { completedSteps, completeStep, mounted } = useStepsProgress("jaakko");
  const { allDimensionsCompleted } = useDimensionsProgress("jaakko");

  // Auto-mark step 1 complete if all dimensions done
  useEffect(() => {
    if (allDimensionsCompleted) {
      completeStep(1);
    }
  }, [allDimensionsCompleted, completeStep]);

  if (!mounted) {
    return <p style={{ textAlign: "center", padding: "2rem" }}>Loading…</p>;
  }

  // Split the steps into prerequisite + reassessment
  const prerequisiteSteps = stepsConfig.slice(0, 4);
  const reassessmentSteps = stepsConfig.slice(4);

  // helper to render a step card
  const renderStep = (step: (typeof stepsConfig)[0]) => {
    const isCompleted = completedSteps.includes(step.id);
    return (
      <div key={step.id} className={styles.stepCard}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>{step.id}</span>
          <span className={styles.stepTitle}>{step.title}</span>
        </div>
        <div className={styles.stepActions}>
          {isCompleted ? (
            <span className={styles.completedWrapper}>
              <CheckCircle className={styles.iconCompleted} />
              <span className={styles.completedText}>Completed</span>
            </span>
          ) : (
            <Circle className={styles.iconPending} />
          )}
          <Link href={step.href} className={styles.button}>
            Go
          </Link>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Welcome to the AI capdev tool</h1>
      <p className={styles.subtitle}>
        Follow the steps below to get a comprehensive status on your company’s AI maturity.
      </p>

      {/* === Prerequisite steps === */}
      <h2 className={styles.sectionTitle}>AI report steps</h2>
      <p className={styles.subtitle2}>
        After completing these steps you will get a comprehensive report on your company’s AI maturity status,
        what is the current state and how to improve next.
      </p>
      <div className={styles.steps}>{prerequisiteSteps.map(renderStep)}</div>

      {/* thin grey line separator */}
      <hr className={styles.divider} />

      {/* === Reassessment steps === */}
      {/* 
      <h2 className={styles.sectionTitle}>Reassessment steps (optional)</h2>
      <p className={styles.subtitle2}>
        In reassessment steps you can level up your company’s AI maturity and track your progress going forward.
      </p>
      <div className={styles.steps}>{reassessmentSteps.map(renderStep)}</div>
      */}
    </main>
  );
}
