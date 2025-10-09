export const dynamic = "force-dynamic";
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateCredentials } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const { email, password, repeatPassword } = await req.json();

    if (!repeatPassword){
        return NextResponse.json({ "error": "No repeat password provided" }, { status: 400 });
    }

    const error = validateCredentials(email, password, repeatPassword);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const supabase = await createClient();

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Supabase signUp error:", signUpError.message);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Automatically log in after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Supabase auto signIn error:", signInError.message);
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Sign up successful",
      user: signInData.user,
    });
  } catch (err) {
    console.error("Signup route error:", err);
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
