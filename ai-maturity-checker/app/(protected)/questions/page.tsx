import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import QuestionsPage from "./QuestionsClient";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic"; // runtime-only

type DimensionInfo = {
  dimension: string;
  title: string;
};

type ProgressData = {
  dimension: string;
  total: number;
  answeredYes: number;
  answeredCount: number;
  percent: number;
};

export default async function QuestionsServer() {
  let email = "unknown";
  let questionsData: { id: string; dimension: string }[] = [];
  let topicsData: { dimension: string; title: string }[] = [];
  let userAnswers: any[] = [];

  try {
    const supabase = await createClient();

    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return <div>No user found</div>;
    email = currentEmail;

    // Fetch all questions
    const { data: qData, error: qError } = await supabase
      .from("Questions")
      .select("id, dimension");
    if (qError) console.error("Failed to fetch questions:", qError.message);
    questionsData = qData || [];

    // Extract unique dimensions
    const uniqueDimensions = Array.from(
      new Set(questionsData.map((q) => q.dimension.split("-")[0]))
    );

    // Fetch topics for these dimensions
    const { data: tData, error: tError } = await supabase
      .from("topics")
      .select("dimension, title")
      .in(
        "dimension",
        uniqueDimensions.length > 0 ? uniqueDimensions : [""]
      );
    if (tError) console.error("Failed to fetch topics:", tError.message);
    topicsData = tData || [];

    // Fetch latest user answers
    const { data: uaData } = await supabase
      .from("user_answers")
      .select("answers")
      .eq("username", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    userAnswers = uaData?.answers || [];

  } catch (err) {
    console.warn("Supabase unavailable or fetch failed, using fallback data:", err);
    // fallback variables already initialized
  }

  // Build dimension info
  const dimensionMap: Record<string, number> = {};
  questionsData.forEach((q) => {
    const dim = q.dimension.split("-")[0];
    dimensionMap[dim] = (dimensionMap[dim] || 0) + 1;
  });

  const uniqueDimensions = Object.keys(dimensionMap).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  const dimensionInfo: DimensionInfo[] = uniqueDimensions.map((dim) => {
    const topic = topicsData.find((t) => t.dimension === dim);
    return {
      dimension: dim,
      title: topic?.title ?? `Untitled (${dim})`,
    };
  });

  // Build progress data
  const progressData: ProgressData[] = uniqueDimensions.map((dim) => {
    const userDim = userAnswers.find((ua: any) => ua.dimension_id === dim);
    const answeredYes = userDim
      ? Object.values(userDim.answers || {}).filter((v) => v === true).length
      : 0;
    const answeredCount = userDim
      ? Object.values(userDim.answers || {}).filter((v) => v !== null && v !== undefined).length
      : 0;
    const total = dimensionMap[dim] || 0;
    const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    return { dimension: dim, total, answeredYes, answeredCount, percent };
  });

  return <QuestionsPage email={email} dimensionInfo={dimensionInfo} progressData={progressData} />;
}
