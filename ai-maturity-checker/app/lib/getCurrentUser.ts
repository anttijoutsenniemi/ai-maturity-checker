import { createClient } from "@/utils/supabase/server";

// Returns the email of the signed-in user, or null
export async function getCurrentUserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.email;
}
