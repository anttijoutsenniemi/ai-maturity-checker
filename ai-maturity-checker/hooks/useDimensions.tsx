"use client";
import { useEffect, useState, useCallback } from "react";

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, 12);
}

export function useDimensionsProgress(username: string, totalDimensions: number) {
  const [completedDimensions, setCompletedDimensions] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Generate hashed storage key
  useEffect(() => {
    if (!username) return;
    hashString(username).then((hashed) => setStorageKey(`app_completed_dimensions_${hashed}`));
  }, [username]);

  // Load from localStorage
  useEffect(() => {
    if (!storageKey) return;
    setMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored) setCompletedDimensions(JSON.parse(stored));
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (!mounted || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(completedDimensions));
  }, [completedDimensions, mounted, storageKey]);

  const completeDimension = useCallback((dimensionId: string) => {
    setCompletedDimensions((prev) => (prev.includes(dimensionId) ? prev : [...prev, dimensionId]));
  }, []);

  const allDimensionsCompleted = totalDimensions > 0 && completedDimensions.length >= totalDimensions;

  return { completedDimensions, completeDimension, allDimensionsCompleted, mounted };
}
