export const dynamic = "force-dynamic";

import { checkIfAdmin } from "@/app/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import AdminPanelClient from "./AdminPanelClient4";

export default async function AdminServer() {
  // --- 1️ Check admin status ---
  let isAdmin = false;
  try {
    isAdmin = await checkIfAdmin();
  } catch (err) {
    console.warn("Admin check failed, assuming non-admin for offline/build:", err);
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied — admin only.
      </div>
    );
  }

  // --- 2️ Fallback data for offline builds ---
  let topicsData: any[] = [];
  let levelsData: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch topics
    const { data: tData, error: tError } = await supabase
      .from("topics")
      .select("id, title, details, dimension")
      .order("id", { ascending: true });
    if (tError) console.error("Error fetching topics:", tError.message);
    else topicsData = tData || [];

    // Fetch capability levels
    const { data: lData, error: lError } = await supabase
      .from("capability_levels")
      .select(
        "id, dimension_id, cl_short, capability_level, details, actions, fair_services, level_actions"
      )
      .order("cl_short", { ascending: true });
    if (lError) console.error("Error fetching capability levels:", lError.message);
    else levelsData = lData || [];
  } catch (err) {
    console.warn("Supabase unavailable, using fallback data:", err);
  }

  // ---  Natural sort on cl_short ---
  const sortedLevels = levelsData.sort((a, b) => {
    const aNum = parseInt(a.cl_short?.replace(/\D/g, "") || "0", 10);
    const bNum = parseInt(b.cl_short?.replace(/\D/g, "") || "0", 10);
    return aNum - bNum;
  });

  return <AdminPanelClient topics={topicsData} capabilityLevels={sortedLevels} />;
}
