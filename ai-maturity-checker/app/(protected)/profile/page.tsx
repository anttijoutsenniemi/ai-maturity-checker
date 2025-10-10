import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import AiProfileClient from "./AiProfileClient";

export const dynamic = "force-dynamic"; // runtime-only

type Topic = {
  id: number;
  title: string;
  dimension: string;
};

type CapabilityLevel = {
  cl_short: string;
  capability_level: string;
  question_ids: string[];
  dimension_id: string;
};

export default async function AiProfileServer() {
  let email = "unknown";
  let topicsData: Topic[] = [];
  let clData: CapabilityLevel[] = [];
  let currentLevels: string[] = [];
  let priorityLevels: string[] = [];
  let gapLevels: string[] = [];

  try {
    const supabase = await createClient();

    // Get user email
    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return <div>No user found</div>;
    email = currentEmail;

    // --- 1️⃣ Fetch topics ---
    const { data: tData, error: tError } = await supabase
      .from("topics")
      .select("id, title, dimension");
    if (tError) console.error("Failed to fetch topics:", tError.message);
    topicsData = tData || [];

    // --- 2️⃣ Fetch capability levels ---
    const { data: cl, error: clError } = await supabase
      .from("capability_levels")
      .select("dimension_id, cl_short, capability_level, question_ids");
    if (clError) console.error("Failed to fetch capability levels:", clError.message);
    clData = cl || [];

    // --- 3️⃣ Fetch user answers ---
    const { data: uaData } = await supabase
      .from("user_answers")
      .select("answers")
      .eq("username", email)
      .single();

    const userAnswers = uaData?.answers
      ? typeof uaData.answers === "string"
        ? JSON.parse(uaData.answers)
        : uaData.answers
      : [];

    // Compute current levels
    for (const dim of userAnswers) {
      const answersObj = dim.answers;
      for (const lvl of clData) {
        if (lvl.dimension_id === dim.dimension_id) {
          const allTrue = lvl.question_ids.every((qid) => answersObj[qid] === true);
          if (allTrue) currentLevels.push(lvl.cl_short);
        }
      }
    }

    // --- 4️⃣ Fetch user priorities ---
    const { data: priorities } = await supabase
      .from("user_priorities")
      .select("priority_dimensions")
      .eq("username", email)
      .single();

    const priorityDimensions = priorities?.priority_dimensions || [];
    if (priorityDimensions.length > 0) {
      priorityLevels = clData
        .filter((lvl) => priorityDimensions.includes(lvl.dimension_id))
        .map((lvl) => lvl.cl_short);
    }

    // --- 5️⃣ Fetch level dependencies and compute gap levels ---
    const { data: deps } = await supabase
      .from("level_dependencies")
      .select("level, dependencies");

    if (deps) {
      const needed = deps
        .filter((d: any) => priorityLevels.includes(d.level))
        .flatMap((d: any) => d.dependencies || []);
      gapLevels = [...new Set(needed)].filter(
        (lvl) => !currentLevels.includes(lvl) && !priorityLevels.includes(lvl)
      );
    }
  } catch (err) {
    console.warn("Supabase fetch failed, using fallback data:", err);
    // all variables already have safe defaults
  }

  return (
    <AiProfileClient
      email={email}
      topics={topicsData}
      capabilityLevels={clData}
      currentLevels={currentLevels}
      gapLevels={gapLevels}
      priorityLevels={priorityLevels}
    />
  );
}
