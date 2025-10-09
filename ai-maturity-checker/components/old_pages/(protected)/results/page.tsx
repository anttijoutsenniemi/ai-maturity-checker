import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import ResultsPage from "./ResultsClient"
import { createClient } from "@/utils/supabase/server"

export default async function ResultsServer() {
  const supabase = await createClient();
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <ResultsPage email={email} />
}