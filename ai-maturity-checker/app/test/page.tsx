"use client";

import { useEffect } from "react";
import { useStepsProgress } from "@/hooks/useStepsProgress";

export default function UploadPOPage() {
  const { completeStep } = useStepsProgress();

  useEffect(() => {
    completeStep(1); // mark step 1 as completed
  }, [completeStep]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Upload Purchase Order</h1>
      <p>Here you can upload your PO file.</p>
    </div>
  );
}
