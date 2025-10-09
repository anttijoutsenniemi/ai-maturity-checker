import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import DimensionClient from "./DimensionClient";

type Question = {
  id: string;
  question: string;
  answers: { text: string }[];
};

// Props type for App Router server component
type Props = {
  params: { dimension: string } | Promise<{ dimension: string }>;
};

export default async function DimensionServer(props: Props) {
  // ✅ Await params before using
  const params = await props.params;
  const dimensionParam = params.dimension;

  const email = await getCurrentUserEmail();
  if (!email) return <div>No user found</div>;

  const supabase = await createClient();
  const dimension = dimensionParam.toUpperCase();

  // Fetch total dimensions
  const { data: topicsData } = await supabase.from("topics").select("id");
  const totalDimensions = topicsData ? topicsData.length : 0;

  // Fetch questions
  const { data: questionData, error: questionError } = await supabase
    .from("Questions")
    .select("*")
    .ilike("dimension", `${dimension}-%`)
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
    })) || [];

  // Fetch user answers for this dimension
  const { data: userData } = await supabase
    .from("user_answers")
    .select("answers")
    .eq("username", email)
    .limit(1)
    .single();

  const userProgress = Array.isArray(userData?.answers)
    ? userData.answers.find((d: any) => d.dimension_id === dimension)
    : null;

  // Check next dimension existence
  const nextDim = `D${parseInt(dimension.slice(1), 10) + 1}`;
  const { data: nextData } = await supabase
    .from("Questions")
    .select("id")
    .ilike("dimension", `${nextDim}-%`)
    .limit(1);

  const nextExists = !!(nextData && nextData.length > 0);

  return (
    <DimensionClient
      email={email}
      dimension={dimension}
      questions={questions}
      totalDimensions={totalDimensions}
      nextExists={nextExists}
    />
  );
}
