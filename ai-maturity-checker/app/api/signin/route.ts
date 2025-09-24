import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Supabase server client for API route
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase signIn error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Just return JSON; no NextResponse.next needed
  return NextResponse.json({
    message: "Sign in successful",
    user: data.user,
  });
}
