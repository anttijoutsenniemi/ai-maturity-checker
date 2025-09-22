import { NextResponse } from "next/server";
import { validateCredentials } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const error = validateCredentials(email, password);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // TODO: Supabase sign-in logic goes here
    return NextResponse.json({ message: "Sign in successful", email });
  } catch (err) {
    console.error("Sign in error:", err);
    return NextResponse.json({ error: "Failed to process sign in" }, { status: 500 });
  }
}
