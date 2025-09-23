import { supabase } from "./supabaseClient";

// Returns the email of the signed-in user, or null
export async function getCurrentUserEmail() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.email;
}
