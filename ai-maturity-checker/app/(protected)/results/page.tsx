import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import ResultsPage from "./ResultsClient";
import { createClient } from "@/utils/supabase/server";

export default async function ResultsServer() {
  const supabase = await createClient();
  const email = await getCurrentUserEmail(); // runs on server

  if (!email) {
    return <div>No user found</div>;
  }

  // Fetch all data on the server side
  const [{ data: topics }, { data: levels }, { data: answers }] = await Promise.all([
    supabase.from("topics").select("*"),
    supabase.from("capability_levels").select("*"),
    supabase
      .from("user_answers")
      .select("answers")
      .eq("username", email)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const userAnswers = answers && answers[0] ? answers[0].answers : [];

  return (
    <ResultsPage
      email={email}
      topics={topics ?? []}
      capLevels={levels ?? []}
      userAnswers={userAnswers ?? []}
    />
  );
}
