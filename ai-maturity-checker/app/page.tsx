"use client";

import { CheckCircle, Circle } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import { stepsConfig } from "@/config/stepsConfig";
import { useStepsProgress } from "@/hooks/useStepsProgress";

export default function HomePage() {
  const { completedSteps, mounted } = useStepsProgress();

  if (!mounted) {
    return <p style={{ textAlign: "center", padding: "2rem" }}>Loading…</p>;
  }

  // Split the steps into prerequisite + reassessment
  const prerequisiteSteps = stepsConfig.slice(0, 2);
  const reassessmentSteps = stepsConfig.slice(2);

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
      <h1 className={styles.title}>Welcome to the App Guide</h1>
      <p className={styles.subtitle}>Follow the steps below to complete your workflow.</p>

      {/* === Prerequisite steps === */}
      <h2 className={styles.sectionTitle}>Prerequisite steps</h2>
      <p className={styles.subtitle2}>The assessment questions help define your companys AI adaptation status. Priority tells which dimension your
      company wants to improve on.</p>
      <div className={styles.steps}>
        {prerequisiteSteps.map(renderStep)}
      </div>

      {/* thin grey line separator */}
      <hr className={styles.divider} />

      {/* === Reassessment steps === */}
      <h2 className={styles.sectionTitle}>Reassessment steps</h2>
      <p className={styles.subtitle2}>In reassessment steps you can level up your companys AI maturity and track your progress going forward.</p>
      <div className={styles.steps}>
        {reassessmentSteps.map(renderStep)}
      </div>
    </main>
  );
}
