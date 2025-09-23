import { NextResponse } from "next/server";
import { validateCredentials } from "@/utils/validation";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const error = validateCredentials(email, password);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Sign in successful", user: data.user });
  } catch (err) {
    console.error("Sign in error:", err);
    return NextResponse.json({ error: "Failed to process sign in" }, { status: 500 });
  }
}
