// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { supabase } from "@/app/lib/supabaseClient";

// const STORAGE_KEY = (username: string) => `app_completed_dimensions_${username}`;

// export function useDimensionsProgress(username: string) {
//   const [completedDimensions, setCompletedDimensions] = useState<string[]>([]);
//   const [totalDimensions, setTotalDimensions] = useState<number | null>(null);
//   const [mounted, setMounted] = useState(false);

//   // Load from localStorage
//   useEffect(() => {
//     setMounted(true);

//     try {
//       const stored = localStorage.getItem(STORAGE_KEY(username));
//       if (stored) {
//         const parsed: string[] = JSON.parse(stored);
//         setCompletedDimensions(parsed);
//       }
//     } catch (e) {
//       console.warn(" Failed to parse completed dimensions", e);
//     }
//   }, [username]);

//   // Save whenever completedDimensions changes
//   useEffect(() => {
//     if (!mounted) return;
//     localStorage.setItem(
//       STORAGE_KEY(username),
//       JSON.stringify(completedDimensions)
//     );
//   }, [completedDimensions, mounted, username]);

//   // Fetch total dimensions from Supabase
//   useEffect(() => {
//     const fetchTopics = async () => {
//       const { data, error } = await supabase.from("topics").select("id");
//       if (error) {
//         console.error(" Failed to fetch topics", error);
//       } else {
//         setTotalDimensions(data.length);
//       }
//     };
//     fetchTopics();
//   }, [supabase]);

//   const completeDimension = useCallback((dimensionId: string) => {
//     setCompletedDimensions((prev) =>
//       prev.includes(dimensionId) ? prev : [...prev, dimensionId]
//     );
//   }, []);

//   const allDimensionsCompleted =
//     totalDimensions !== null &&
//     completedDimensions.length >= totalDimensions;

//   return {
//     completedDimensions,
//     completeDimension,
//     totalDimensions,
//     allDimensionsCompleted,
//     mounted,
//   };
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabaseClient";

//  Hash helper: one-way, consistent, short
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // base64url encoding
  return hashBase64.slice(0, 12); // shorten to 12 chars
}

export function useDimensionsProgress(username: string) {
  const [completedDimensions, setCompletedDimensions] = useState<string[]>([]);
  const [totalDimensions, setTotalDimensions] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Generate hashed key based on username
  useEffect(() => {
    if (!username) return;
    hashString(username).then((hashed) =>
      setStorageKey(`app_completed_dimensions_${hashed}`)
    );
  }, [username]);

  // Load from localStorage
  useEffect(() => {
    if (!storageKey) return;
    setMounted(true);

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        setCompletedDimensions(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse completed dimensions", e);
    }
  }, [storageKey]);

  // Save whenever completedDimensions changes
  useEffect(() => {
    if (!mounted || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(completedDimensions));
  }, [completedDimensions, mounted, storageKey]);

  // Fetch total dimensions from Supabase
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase.from("topics").select("id");
      if (error) {
        console.error("Failed to fetch topics", error);
      } else {
        setTotalDimensions(data.length);
      }
    };
    fetchTopics();
  }, []);

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

