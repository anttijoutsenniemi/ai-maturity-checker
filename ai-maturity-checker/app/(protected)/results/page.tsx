import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import ResultsPage from "./ResultsClient";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic"; // runtime-only rendering

export default async function ResultsServer() {
  let email = "unknown";
  let topics: any[] = [];
  let levels: any[] = [];
  let userAnswers: any[] = [];

  try {
    const supabase = await createClient();

    // get user email
    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) return <div>No user found</div>;
    email = currentEmail;

    // Fetch all data in parallel
    const [{ data: tData }, { data: lData }, { data: aData }] = await Promise.all([
      supabase.from("topics").select("*"),
      supabase.from("capability_levels").select("*"),
      supabase
        .from("user_answers")
        .select("answers")
        .eq("username", email)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    topics = tData ?? [];
    levels = lData ?? [];
    userAnswers = aData && aData[0] ? aData[0].answers : [];
  } catch (err) {
    console.warn("Supabase unavailable or fetch failed, using fallback data:", err);
    // all variables already have safe fallbacks
  }

  return (
    <ResultsPage
      email={email}
      topics={topics}
      capLevels={levels}
      userAnswers={userAnswers}
    />
  );
}
