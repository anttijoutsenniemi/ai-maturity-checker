import { NextResponse } from "next/server";
import { checkIfAdmin } from "@/app/lib/checkAdminSalis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { salis, section1, section2 } = body;

    // Password check
    const isAdmin = await checkIfAdmin(salis);
    if (!isAdmin) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Validate input
    if (section1 && !Array.isArray(section1))
      return NextResponse.json({ error: "Invalid section1 format" }, { status: 400 });

    if (section2 && !Array.isArray(section2))
      return NextResponse.json({ error: "Invalid section2 format" }, { status: 400 });

    // Update Section 1 (topics)
    if (section1) {
      for (const t of section1) {
        if (t.title.length > 500 || t.details.length > 5000)
          return NextResponse.json({ error: "Section1 data too long" }, { status: 400 });

        await supabase
          .from("topics")
          .update({ title: t.title, details: t.details })
          .eq("id", t.id);
      }
    }

    // Update Section 2 (capability_levels)
    if (section2) {
      for (const c of section2) {
        if (c.capability_level.length > 500 || c.details.length > 5000)
          return NextResponse.json({ error: "Section2 data too long" }, { status: 400 });

        await supabase
          .from("capability_levels")
          .update({
            capability_level: c.capability_level,
            details: c.details,
            actions: c.actions,
            fair_services: c.fair_services,
            level_actions: c.level_actions,
          })
          .eq("id", c.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin update failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
