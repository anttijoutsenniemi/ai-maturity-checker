// app/ai-profile/AiProfileServer.tsx
import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import AiProfileClient from "./AiProfileClient";

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
  const email = await getCurrentUserEmail();
  if (!email) return <div>No user found</div>;

  const supabase = await createClient();

  // --- 1️⃣ Fetch topics ---
  const { data: topicsData, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, dimension");
  if (topicsError) {
    console.error("Failed to fetch topics:", topicsError.message);
    return <div>Error loading data</div>;
  }

  // --- 2️⃣ Fetch capability levels ---
  const { data: clData, error: clError } = await supabase
    .from("capability_levels")
    .select("dimension_id, cl_short, capability_level, question_ids");
  if (clError) {
    console.error("Failed to fetch capability levels:", clError.message);
    return <div>Error loading data</div>;
  }

  // --- 3️⃣ Fetch user answers to compute current levels ---
  const { data: uaData } = await supabase
    .from("user_answers")
    .select("answers")
    .eq("username", email)
    .single();

  let currentLevels: string[] = [];
  if (uaData?.answers) {
    const parsedAnswers =
      typeof uaData.answers === "string"
        ? JSON.parse(uaData.answers)
        : uaData.answers;

    for (const dim of parsedAnswers) {
      const answersObj = dim.answers;
      for (const lvl of clData || []) {
        if (lvl.dimension_id === dim.dimension_id) {
          const allTrue = lvl.question_ids.every(
            (qid: string) => answersObj[qid] === true
          );
          if (allTrue) currentLevels.push(lvl.cl_short);
        }
      }
    }
  }

  // --- 4️⃣ Fetch user priorities ---
const { data: priorities } = await supabase
  .from("user_priorities")
  .select("priority_dimensions")
  .eq("username", email)
  .single();

const priorityDimensions = priorities?.priority_dimensions ?? [];

let priorityLevels: string[] = [];
if (priorityDimensions.length > 0) {
  priorityLevels = (clData || [])
    .filter((lvl) => priorityDimensions.includes(lvl.dimension_id))
    .map((lvl) => lvl.cl_short);
}

  // --- 5️⃣ Fetch level dependencies and compute gap levels ---
  const { data: deps } = await supabase
    .from("level_dependencies")
    .select("level, dependencies");

  let gapLevels: string[] = [];
  if (deps) {
    const needed = deps
      .filter((d: any) => priorityLevels.includes(d.level))
      .flatMap((d: any) => d.dependencies || []);
    gapLevels = [...new Set(needed)].filter(
      (lvl: string) => !currentLevels.includes(lvl) && !priorityLevels.includes(lvl)
    );
  }

  return (
    <AiProfileClient
      email={email}
      topics={topicsData || []}
      capabilityLevels={clData || []}
      currentLevels={currentLevels}
      gapLevels={gapLevels}
      priorityLevels={priorityLevels}
    />
  );
}

