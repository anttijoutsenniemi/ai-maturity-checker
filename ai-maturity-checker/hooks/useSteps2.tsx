"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = (username: string) => `app_completed_steps_${username}`;

export function useStepsProgress(username: string) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY(username));
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        console.log(`Loaded completed steps for ${username}:`, parsed);
        setCompletedSteps(parsed);
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse completed steps", e);
    }
  }, [username]);

  useEffect(() => {
    if (!mounted) return;
    console.log(` Saving completed steps for ${username}:`, completedSteps);
    localStorage.setItem(STORAGE_KEY(username), JSON.stringify(completedSteps));
  }, [completedSteps, mounted, username]);

  const completeStep = useCallback((stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  }, []);

  return { completedSteps, completeStep, mounted };
}
