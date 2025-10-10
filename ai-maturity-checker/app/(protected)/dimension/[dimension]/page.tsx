import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import { createClient } from "@/utils/supabase/server";
import DimensionClient from "./DimensionClient";

type Question = {
  id: string;
  question: string;
  answers: { text: string }[];
};

export const dynamic = "force-dynamic"; // runtime-only

export default async function DimensionServer({
  params,
}: {
  params: Promise<{ dimension: string }>;
}) {
  const { dimension } = await params;

  // fallback email for offline / local builds
  let email = "unknown";
  try {
    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return <div>No user found</div>;
    email = currentEmail;
  } catch {
    console.warn("Could not get current user, using fallback email.");
  }

  const supabase = await createClient();

  // Fetch total dimensions with fallback
  let totalDimensions = 0;
  try {
    const { data: topicsData } = await supabase.from("topics").select("id");
    totalDimensions = topicsData?.length ?? 0;
  } catch {
    console.warn("Could not fetch topics, defaulting totalDimensions = 0");
  }

  // Fetch questions with fallback
  let questions: Question[] = [];
  try {
    const { data: questionData, error } = await supabase
      .from("Questions")
      .select("*")
      .ilike("dimension", `${dimension.toUpperCase()}-%`)
      .order("dimension", { ascending: true });

    if (error) throw error;

    questions =
      questionData?.map((q) => ({
        id: q.id,
        question: q.question,
        answers: q.answers?.map((text: string) => ({ text })) || [],
      })) ?? [];
  } catch {
    console.warn("Could not fetch questions, returning empty array");
  }

  // Check next dimension existence with fallback
  let nextExists = false;
  try {
    const nextDim = `D${parseInt(dimension.slice(1), 10) + 1}`;
    const { data: nextData } = await supabase
      .from("Questions")
      .select("id")
      .ilike("dimension", `${nextDim}-%`)
      .limit(1);

    nextExists = !!(nextData && nextData.length > 0);
  } catch {
    console.warn("Could not check next dimension, defaulting to false");
  }

  //  All props fully defined — no optionals needed downstream
  return (
    <DimensionClient
      email={email}
      dimension={dimension.toUpperCase()}
      questions={questions}
      totalDimensions={totalDimensions}
      nextExists={nextExists}
    />
  );
}
