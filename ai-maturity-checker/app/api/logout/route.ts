import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out the user server-side
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signOut error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return empty JSON; cookies are cleared automatically
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout route error:", err);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
