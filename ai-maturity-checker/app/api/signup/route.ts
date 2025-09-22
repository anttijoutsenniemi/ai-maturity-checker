import { NextResponse } from "next/server";
import { validateCredentials } from "@/utils/validation";

export async function POST(req: Request) {
  try {
    const { email, password, repeatPassword } = await req.json();

    const error = validateCredentials(email, password, repeatPassword);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // TODO: Supabase sign-up logic goes here
    return NextResponse.json({ message: "Sign up successful", email });
  } catch (err) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: "Failed to process sign up" }, { status: 500 });
  }
}
