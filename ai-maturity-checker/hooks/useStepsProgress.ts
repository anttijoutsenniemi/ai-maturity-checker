"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "app_completed_steps";

export function useStepsProgress() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage only after mount
  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        console.log("🔄 Loaded completed steps from localStorage:", parsed);
        setCompletedSteps(parsed);
      } else {
        console.log("ℹ️ No completed steps found in localStorage yet");
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse completed steps from localStorage", e);
    }
  }, []);

  // Save whenever completedSteps changes
  useEffect(() => {
    if (!mounted) return; // don’t run until after mount
    console.log("💾 Saving completed steps:", completedSteps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
  }, [completedSteps, mounted]);

  // Mark step completed
  const completeStep = useCallback((stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  }, []);

  return { completedSteps, completeStep, mounted };
}
