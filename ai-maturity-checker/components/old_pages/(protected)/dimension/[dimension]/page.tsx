import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import DimensionPage from "./DimensionClient"

export default async function DimensionPageServer() {
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <DimensionPage email={email} />
}