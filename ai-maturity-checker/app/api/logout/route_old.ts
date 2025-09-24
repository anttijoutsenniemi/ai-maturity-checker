import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Signed out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
