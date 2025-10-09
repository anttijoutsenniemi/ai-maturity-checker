// import { getCurrentUserEmail } from "@/app/lib/getCurrentUser"
// import HomePage from "./HomePageClient"
// import { checkIfAdmin } from "@/app/lib/checkAdmin"

// export default async function HomePageServer() {
//   const email = await getCurrentUserEmail() // runs on server

//   if (!email) {
//     return <div>No user found</div>
//   }

//   return <HomePage email={email} />
// }

import Link from "next/link";
import { getCurrentUserEmail } from "@/app/lib/getCurrentUser";
import HomePage from "./HomePageClient";
import { checkIfAdmin } from "@/app/lib/checkAdmin";

export default async function HomePageServer() {
  const email = await getCurrentUserEmail();

  if (!email) {
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

  const isAdmin = await checkIfAdmin();

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
      <HomePage email={email} />

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
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            transition: "all 0.2s ease",
          }}
        >
          Go to Admin Page
        </Link>
      )}
    </div>
  );
}
