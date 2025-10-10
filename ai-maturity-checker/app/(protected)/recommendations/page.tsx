import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import RecommendationsPage from "./RecommendationsClient";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic"; // runtime-only

type CapabilityLevel = {
  cl_short: string;
  capability_level: string;
  dimension_id: string;
  question_ids: string[];
  actions: Record<string, string[]>;
  fair_services: { fair_services: string[] };
  level_actions: string[];
};

type UserAnswer = {
  dimension_id: string;
  answers: Record<string, boolean>;
};

export default async function RecommendationsServer() {
  let email = "unknown";
  let allLevels: CapabilityLevel[] = [];
  let userAnswers: UserAnswer[] = [];
  let priorities: any = {};
  let deps: any[] = [];

  try {
    const supabase = await createClient();

    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return <div>No user found</div>;
    email = currentEmail;

    // Fetch all needed tables in parallel
    const [
      { data: clData },
      { data: uaData },
      { data: prData },
      { data: depData },
    ] = await Promise.all([
      supabase
        .from("capability_levels")
        .select(
          "dimension_id,cl_short,capability_level,question_ids,actions,fair_services,level_actions"
        ),
      supabase.from("user_answers").select("answers").eq("username", email).single(),
      supabase.from("user_priorities").select("priority_dimensions").eq("username", email).single(),
      supabase.from("level_dependencies").select("level, dependencies"),
    ]);

    allLevels = clData || [];
    userAnswers =
      typeof uaData?.answers === "string" ? JSON.parse(uaData.answers) : uaData?.answers || [];
    priorities = prData || {};
    deps = depData || [];
  } catch (err) {
    console.warn("Supabase unavailable or fetch failed, using fallback data:", err);
    // fallback variables already initialized
  }

  // Determine completed levels
  const completed: string[] = [];
  for (const dim of userAnswers) {
    for (const lvl of allLevels) {
      if (lvl.dimension_id === dim.dimension_id) {
        const allTrue = lvl.question_ids.every((qid) => dim.answers[qid] === true);
        if (allTrue) completed.push(lvl.cl_short);
      }
    }
  }

  // Determine desired (priority) levels
  const desiredShorts =
    (allLevels || [])
      .filter((lvl) => priorities?.priority_dimensions?.includes(lvl.dimension_id))
      .map((lvl) => lvl.cl_short) || [];

  // Determine dependency-based gap levels
  let gapShorts: string[] = [];
  if (deps.length) {
    const needed = deps
      .filter((d: any) => desiredShorts.includes(d.level))
      .flatMap((d: any) => d.dependencies || []);
    gapShorts = [...new Set(needed)].filter(
      (lvl: string) => !completed.includes(lvl) && !desiredShorts.includes(lvl)
    );
  }

  const gapLevels = allLevels.filter((cl) => gapShorts.includes(cl.cl_short));
  const desiredLevels = allLevels.filter((cl) => desiredShorts.includes(cl.cl_short));

  // Filter actions based on what user answered false
  const filterActions = (cl: CapabilityLevel) => {
    const dimAnswers = userAnswers.find((ua) => ua.dimension_id === cl.dimension_id);
    if (!dimAnswers) return cl; // no filtering if no answers

    const filtered: Record<string, string[]> = {};
    for (const qid of cl.question_ids) {
      const answered = dimAnswers.answers[qid];
      if ((answered === false || answered === undefined) && cl.actions[qid]) {
        filtered[qid] = cl.actions[qid];
      }
    }
    return {
      ...cl,
      actions: filtered,
    };
  };

  const filteredGapLevels = gapLevels.map(filterActions);
  const filteredDesiredLevels = desiredLevels.map(filterActions);

  return (
    <RecommendationsPage
      email={email}
      gapLevels={filteredGapLevels}
      desiredLevels={filteredDesiredLevels}
    />
  );
}
