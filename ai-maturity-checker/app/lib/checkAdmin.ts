import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";

export async function checkIfAdmin(): Promise<boolean> {
  const email = await getCurrentUserEmail();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email || !adminEmail) return false;

  return email.toLowerCase() === adminEmail.toLowerCase();
}