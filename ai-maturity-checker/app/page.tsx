"use client";

import { CheckCircle, Circle } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import { stepsConfig } from "@/config/stepsConfig";
import { useStepsProgress } from "@/hooks/useStepsProgress";

export default function HomePage() {
  const { completedSteps, mounted } = useStepsProgress();

  if (!mounted) {
    // show a loader until localStorage is read
    return <p style={{ textAlign: "center", padding: "2rem" }}>Loading…</p>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Welcome to the App Guide</h1>
      <p className={styles.subtitle}>Follow the steps below to complete your workflow.</p>

      <div className={styles.steps}>
        {stepsConfig.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          // console.log(`Step ${step.id}: completed?`, isCompleted);

          return (
            <div key={step.id} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>{step.id}</span>
                <span className={styles.stepTitle}>{step.title}</span>
              </div>
              <div className={styles.stepActions}>
                {isCompleted ? (
                  <CheckCircle className={styles.iconCompleted} />
                ) : (
                  <Circle className={styles.iconPending} />
                )}
                <Link href={step.href} className={styles.button}>
                  Go
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
