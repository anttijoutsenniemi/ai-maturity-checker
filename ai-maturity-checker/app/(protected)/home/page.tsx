import Link from "next/link";
import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import HomePage from "./HomePageClient";
import { checkIfAdmin } from "@/app/lib/checkAdmin";
import { supabase } from "@/app/lib/supabaseClient";

export const dynamic = "force-dynamic"; // runtime-only

export default async function HomePageServer() {
  let email = "unknown";
  let totalDimensions = 0;
  let isAdmin = false;

  try {
    // Get current user
    const currentEmail = await getCurrentUserEmail();
    if (!currentEmail) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            color: "#444",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No user found</h2>
          <p style={{ color: "#777" }}>Please sign in to continue.</p>
        </div>
      );
    }
    email = currentEmail;

    // Check admin
    isAdmin = await checkIfAdmin();

    // Fetch total dimensions
    const { data: topicsData, error } = await supabase.from("topics").select("id");
    if (error) console.warn("Failed to fetch topics:", error.message);
    totalDimensions = topicsData?.length ?? 0;
  } catch (err) {
    console.warn("Supabase or auth fetch failed, using fallback data:", err);
    // email and totalDimensions already have safe defaults
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      <HomePage email={email} totalDimensions={totalDimensions} />
      {isAdmin && (
        <Link
          href="/admin"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 500,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
        >
          Go to Admin Page
        </Link>
      )}
    </div>
  );
}
