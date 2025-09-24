import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import RecommendationsPage from "./RecommendationsClient"

export default async function RecommendationsServer() {
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <RecommendationsPage email={email} />
}