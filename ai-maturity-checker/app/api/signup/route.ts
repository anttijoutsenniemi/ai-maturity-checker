import { NextResponse } from "next/server";
import { validateCredentials } from "@/utils/validation";
import { supabase } from "@/app/lib/supabaseClient";

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Sign up successful", user: data.user });
  } catch (err) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: "Failed to process sign up" }, { status: 500 });
  }
}
