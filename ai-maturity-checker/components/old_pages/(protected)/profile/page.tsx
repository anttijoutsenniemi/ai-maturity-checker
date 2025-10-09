import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import AiProfileClient from "./AiProfileClient"

export default async function AiProfilePage() {
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <AiProfileClient email={email} />
}
