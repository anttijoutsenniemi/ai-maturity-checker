import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
import QuestionsPage from "./QuestionsClient"

export default async function QuestionsServer() {
  const email = await getCurrentUserEmail() // runs on server

  if (!email) {
    return <div>No user found</div>
  }

  return <QuestionsPage email={email} />
}