// app/recommendations/RecommendationsServer.tsx
import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import RecommendationsPage from "./RecommendationsClient";
import { createClient } from "@/utils/supabase/server";

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
  const email = await getCurrentUserEmail();
  if (!email) return <div>No user found</div>;

  const supabase = await createClient();

  // Fetch all needed tables in parallel
  const [
    { data: clData },
    { data: uaData },
    { data: priorities },
    { data: deps },
  ] = await Promise.all([
    supabase
      .from("capability_levels")
      .select("dimension_id,cl_short,capability_level,question_ids,actions,fair_services,level_actions"),
    supabase.from("user_answers").select("answers").eq("username", email).single(),
    supabase.from("user_priorities").select("priority_dimensions").eq("username", email).single(),
    supabase.from("level_dependencies").select("level, dependencies"),
  ]);

  const allLevels: CapabilityLevel[] = clData || [];
  const userAnswers: UserAnswer[] =
    typeof uaData?.answers === "string" ? JSON.parse(uaData.answers) : uaData?.answers || [];

  // Determine completed levels
  let completed: string[] = [];
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
  if (deps) {
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
