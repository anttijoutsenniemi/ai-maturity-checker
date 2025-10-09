import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import QuestionsPage from "./QuestionsClient";
import { createClient } from "@/utils/supabase/server";

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
  const email = await getCurrentUserEmail();
  if (!email) return <div>No user found</div>;

  const supabase = await createClient();

  // --- Fetch all questions ---
  const { data: questionsData, error: questionsError } = await supabase
    .from("Questions")
    .select("id, dimension");

  if (questionsError) {
    console.error("Failed to fetch questions:", questionsError.message);
    return <div>Error loading data</div>;
  }

  const dimensionMap: Record<string, number> = {};
  questionsData?.forEach((q) => {
    const dim = q.dimension.split("-")[0];
    dimensionMap[dim] = (dimensionMap[dim] || 0) + 1;
  });

  const uniqueDimensions = Object.keys(dimensionMap).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  // --- Fetch topics ---
  const { data: topicsData, error: topicsError } = await supabase
    .from("topics")
    .select("dimension, title")
    .in("dimension", uniqueDimensions);

  if (topicsError) {
    console.error("Failed to fetch topics:", topicsError.message);
    return <div>Error loading data</div>;
  }

  const dimensionInfo: DimensionInfo[] = uniqueDimensions.map((dim) => {
    const topic = topicsData?.find((t) => t.dimension === dim);
    return {
      dimension: dim,
      title: topic?.title ?? `Untitled (${dim})`,
    };
  });

  // --- Fetch latest user answers ---
  const { data: answersData } = await supabase
    .from("user_answers")
    .select("answers")
    .eq("username", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const userAnswers = answersData?.answers || [];

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
