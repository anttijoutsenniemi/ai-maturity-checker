"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const STORAGE_KEY = (username: string) => `app_completed_dimensions_${username}`;

export function useDimensionsProgress(username: string = "jaakko") {
  const [completedDimensions, setCompletedDimensions] = useState<string[]>([]);
  const [totalDimensions, setTotalDimensions] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY(username));
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        setCompletedDimensions(parsed);
      }
    } catch (e) {
      console.warn("⚠️ Failed to parse completed dimensions", e);
    }
  }, [username]);

  // Save whenever completedDimensions changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY(username),
      JSON.stringify(completedDimensions)
    );
  }, [completedDimensions, mounted, username]);

  // Fetch total dimensions from Supabase
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select("id");
      if (error) {
        console.error("❌ Failed to fetch topics", error);
      } else {
        setTotalDimensions(data.length);
      }
    };
    fetchTopics();
  }, [supabase]);

  const completeDimension = useCallback((dimensionId: string) => {
    setCompletedDimensions((prev) =>
      prev.includes(dimensionId) ? prev : [...prev, dimensionId]
    );
  }, []);

  const allDimensionsCompleted =
    totalDimensions !== null &&
    completedDimensions.length >= totalDimensions;

  return {
    completedDimensions,
    completeDimension,
    totalDimensions,
    allDimensionsCompleted,
    mounted,
  };
}
