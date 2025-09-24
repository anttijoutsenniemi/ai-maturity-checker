import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import HomePage from "./HomePageClient"

export default async function HomePageServer() {
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <HomePage email={email} />
}