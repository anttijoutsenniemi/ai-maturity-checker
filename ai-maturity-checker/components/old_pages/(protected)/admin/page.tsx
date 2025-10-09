import { checkIfAdmin } from "@/app/lib/checkAdmin";
import AdminPanelClient from "@/app/(protected)/admin/AdminPanelClient4";

export default async function AdminPage() {
  const isAdmin = await checkIfAdmin();

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied — admin only.
      </div>
    );
  }

  return <AdminPanelClient />;
}