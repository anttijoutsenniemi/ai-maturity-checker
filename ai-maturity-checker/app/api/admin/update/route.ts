import { NextResponse } from "next/server";
import { checkIfAdmin } from "@/app/lib/checkAdminSalis";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { salis, changes } = await req.json();

    // Verify admin
    const isAdmin = await checkIfAdmin(salis);
    if (!isAdmin) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    if (!Array.isArray(changes)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    for (const change of changes) {
      const { section, id, changes: fields } = change;

      if (!section || !id || typeof fields !== "object") continue;

      // Basic validation example
      for (const [key, value] of Object.entries(fields)) {
        if (typeof value === "string" && value.length > 5000) {
          return NextResponse.json({ error: `Field ${key} too long` }, { status: 400 });
        }
      }

      if (section === "topics") {
        await supabase.from("topics").update(fields).eq("id", id);
      } else if (section === "capability_levels") {
        await supabase.from("capability_levels").update(fields).eq("id", id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin update failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
