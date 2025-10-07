// OLD METHOD

// "use client";

// import { useEffect, useState, useCallback } from "react";

// const STORAGE_KEY = (username: string) => `app_completed_steps_${username}`;

// export function useStepsProgress(username: string) {
//   const [completedSteps, setCompletedSteps] = useState<number[]>([]);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);

//     try {
//       const stored = localStorage.getItem(STORAGE_KEY(username));
//       if (stored) {
//         const parsed: number[] = JSON.parse(stored);
//         console.log(`Loaded completed steps for ${username}:`, parsed);
//         setCompletedSteps(parsed);
//       }
//     } catch (e) {
//       console.warn(" Failed to parse completed steps", e);
//     }
//   }, [username]);

//   useEffect(() => {
//     if (!mounted) return;
//     console.log(` Saving completed steps for ${username}:`, completedSteps);
//     localStorage.setItem(STORAGE_KEY(username), JSON.stringify(completedSteps));
//   }, [completedSteps, mounted, username]);

//   const completeStep = useCallback((stepId: number) => {
//     setCompletedSteps((prev) =>
//       prev.includes(stepId) ? prev : [...prev, stepId]
//     );
//   }, []);

//   return { completedSteps, completeStep, mounted };
// }

///NEW HASHED METHOD

"use client";

import { useEffect, useState, useCallback } from "react";

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return hashBase64.slice(0, 12);
}

export function useStepsProgress(username: string) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    hashString(username).then((hashed) =>
      setStorageKey(`app_completed_steps_${hashed}`)
    );
  }, [username]);

  useEffect(() => {
    if (!storageKey) return;
    setMounted(true);

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        console.log(`Loaded completed steps for ${username}:`, parsed);
        setCompletedSteps(parsed);
      }
    } catch (e) {
      console.warn(" Failed to parse completed steps", e);
    }
  }, [storageKey, username]);

  useEffect(() => {
    if (!mounted || !storageKey) return;
    console.log(` Saving completed steps for ${username}:`, completedSteps);
    localStorage.setItem(storageKey, JSON.stringify(completedSteps));
  }, [completedSteps, mounted, storageKey, username]);

  const completeStep = useCallback((stepId: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );
  }, []);

  return { completedSteps, completeStep, mounted };
}

