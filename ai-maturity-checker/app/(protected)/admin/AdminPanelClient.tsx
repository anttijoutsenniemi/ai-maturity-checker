"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import styles from "./admin-panel.module.css";

type Topic = {
  id: number;
  title: string;
  details: string;
  dimension: string;
};

type CapabilityLevel = {
  id: string;
  dimension_id: string;
  cl_short: string;
  capability_level: string;
  details: string;
  actions: Record<string, string[]>;
  fair_services: Record<string, string[]>;
  level_actions: string[];
};

export default function AdminPanelClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [capabilityLevels, setCapabilityLevels] = useState<CapabilityLevel[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fetching, setFetching] = useState(true);

  //  Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("id, title, details, dimension")
          .order("id", { ascending: true });

        if (topicsError) throw new Error(topicsError.message);
        setTopics(topicsData || []);

        const { data: levelsData, error: levelsError } = await supabase
          .from("capability_levels")
          .select("id, dimension_id, cl_short, capability_level, details, actions, fair_services, level_actions")
          .order("cl_short", { ascending: true });

        if (levelsError) throw new Error(levelsError.message);
        setCapabilityLevels(levelsData || []);
      } catch (err: any) {
        console.error("Failed to fetch admin data:", err.message);
        setMessage({ type: "error", text: "Failed to load data: " + err.message });
      } finally {
        setFetching(false);
      }
    }

    fetchData();
  }, []);

  async function handleUpdate() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salis: password,
          section1: topics,
          section2: capabilityLevels,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage({ type: "success", text: "Update successful!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className={styles.container}>Loading data...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Panel</h1>

      {/* SECTION 1 */}
      <section className={styles.section}>
        <h2>1. Main Topics</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title (editable)</th>
              <th>Details (editable)</th>
              <th>Dimension</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t, i) => (
              <tr key={t.id}>
                <td className={styles.grey}>{t.id}</td>
                <td>
                  <textarea
                    value={t.title || ""}
                    onChange={(e) => {
                      const newData = [...topics];
                      newData[i].title = e.target.value;
                      setTopics(newData);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={t.details || ""}
                    onChange={(e) => {
                      const newData = [...topics];
                      newData[i].details = e.target.value;
                      setTopics(newData);
                    }}
                  />
                </td>
                <td className={styles.grey}>{t.dimension}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SECTION 2 */}
      <section className={styles.section}>
        <h2>2. Capability Levels</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Capability Level (editable)</th>
              <th>Details (editable)</th>
              <th>Actions (JSON)</th>
              <th>Fair Services (JSON)</th>
              <th>Level Actions (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {capabilityLevels.map((c, i) => (
              <tr key={c.id}>
                <td className={styles.grey}>{c.cl_short}</td>
                <td>
                  <textarea
                    value={c.capability_level || ""}
                    onChange={(e) => {
                      const newData = [...capabilityLevels];
                      newData[i].capability_level = e.target.value;
                      setCapabilityLevels(newData);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={c.details || ""}
                    onChange={(e) => {
                      const newData = [...capabilityLevels];
                      newData[i].details = e.target.value;
                      setCapabilityLevels(newData);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={JSON.stringify(c.actions, null, 2) || ""}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const newData = [...capabilityLevels];
                        newData[i].actions = parsed;
                        setCapabilityLevels(newData);
                      } catch {}
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={JSON.stringify(c.fair_services, null, 2) || ""}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const newData = [...capabilityLevels];
                        newData[i].fair_services = parsed;
                        setCapabilityLevels(newData);
                      } catch {}
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={JSON.stringify(c.level_actions, null, 2) || ""}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        const newData = [...capabilityLevels];
                        newData[i].level_actions = parsed;
                        setCapabilityLevels(newData);
                      } catch {}
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FOOTER */}
      <div className={styles.footer}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          className={styles.updateBtn}
        >
          {loading ? "Updating..." : "Update Data"}
        </button>
      </div>

      {message && (
        <div
          className={`${styles.message} ${
            message.type === "success" ? styles.success : styles.error
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
