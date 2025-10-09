// app/admin/AdminServer.tsx
import { checkIfAdmin } from "@/app/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import AdminPanelClient from "./AdminPanelClient4";

export default async function AdminServer() {
  const isAdmin = await checkIfAdmin();

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied — admin only.
      </div>
    );
  }

  const supabase = await createClient();

  // fetch topics
  const { data: topicsData, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, details, dimension")
    .order("id", { ascending: true });

  if (topicsError) {
    console.error("Error fetching topics:", topicsError.message);
    return <div>Error loading topics.</div>;
  }

  // fetch capability levels
  const { data: levelsData, error: levelsError } = await supabase
    .from("capability_levels")
    .select(
      "id, dimension_id, cl_short, capability_level, details, actions, fair_services, level_actions"
    )
    .order("cl_short", { ascending: true });

  if (levelsError) {
    console.error("Error fetching capability levels:", levelsError.message);
    return <div>Error loading capability levels.</div>;
  }

  // natural sort on cl_short
  const sortedLevels = (levelsData || []).sort((a, b) => {
    const aNum = parseInt(a.cl_short.replace(/\D/g, ""), 10);
    const bNum = parseInt(b.cl_short.replace(/\D/g, ""), 10);
    return aNum - bNum;
  });

  return <AdminPanelClient topics={topicsData || []} capabilityLevels={sortedLevels} />;
}
