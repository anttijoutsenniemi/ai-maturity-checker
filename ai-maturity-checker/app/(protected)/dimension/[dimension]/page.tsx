import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import DimensionClient from "./DimensionClient";

type Question = {
  id: string;
  question: string;
  answers: { text: string }[];
};

export default async function DimensionServer({
  params,
}: {
  params: Promise<{ dimension: string }>;
}) {
  const { dimension } = await params;
  const email = await getCurrentUserEmail();
  if (!email) return <div>No user found</div>;

  const supabase = await createClient();
  const dim = dimension.toUpperCase();

  // Fetch total dimensions
  const { data: topicsData } = await supabase.from("topics").select("id");
  const totalDimensions = topicsData?.length ?? 0;

  // Fetch questions
  const { data: questionData, error: questionError } = await supabase
    .from("Questions")
    .select("*")
    .ilike("dimension", `${dim}-%`)
    .order("dimension", { ascending: true });

  if (questionError) {
    console.error("Error fetching questions:", questionError.message);
    return <div>Error loading questions.</div>;
  }

  const questions: Question[] =
    questionData?.map((q) => ({
      id: q.id,
      question: q.question,
      answers: q.answers.map((text: string) => ({ text })),
    })) ?? [];

  // Fetch user answers
  const { data: userData } = await supabase
    .from("user_answers")
    .select("answers")
    .eq("username", email)
    .limit(1)
    .single();

  const userProgress = Array.isArray(userData?.answers)
    ? userData.answers.find((d: any) => d.dimension_id === dim)
    : null;

  // Check next dimension existence
  const nextDim = `D${parseInt(dim.slice(1), 10) + 1}`;
  const { data: nextData } = await supabase
    .from("Questions")
    .select("id")
    .ilike("dimension", `${nextDim}-%`)
    .limit(1);

  const nextExists = !!(nextData && nextData.length > 0);

  return (
    <DimensionClient
      email={email}
      dimension={dim}
      questions={questions}
      totalDimensions={totalDimensions}
      nextExists={nextExists}
    />
  );
}
