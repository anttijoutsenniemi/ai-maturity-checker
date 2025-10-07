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
  actions: Record<string, string[]>; // e.g. { "D2-Q1": [ "Action 1", "Action 2" ] }
  fair_services: { fair_services: string[] }; // e.g. { fair_services: [ "Service 1", "Service 2" ] }
  level_actions: string[];
};

export default function AdminPanelClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [capabilityLevels, setCapabilityLevels] = useState<CapabilityLevel[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [fetching, setFetching] = useState(true);

  // 🧠 Fetch data
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
              <th>Title</th>
              <th>Details</th>
              <th>Dimension</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t, i) => (
              <tr key={t.id}>
                <td className={styles.grey}>{t.id}</td>
                <td>
                  <input
                    value={t.title}
                    onChange={(e) => {
                      const newData = [...topics];
                      newData[i].title = e.target.value;
                      setTopics(newData);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={t.details}
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
        {capabilityLevels.map((c, i) => (
          <div key={c.id} className={styles.capabilityBox}>
            <h3>{c.cl_short} — {c.capability_level}</h3>

            <label>
              <strong>Capability Level:</strong>
              <textarea
                value={c.capability_level}
                onChange={(e) => {
                  const newData = [...capabilityLevels];
                  newData[i].capability_level = e.target.value;
                  setCapabilityLevels(newData);
                }}
              />
            </label>

            <label>
              <strong>Details:</strong>
              <textarea
                value={c.details}
                onChange={(e) => {
                  const newData = [...capabilityLevels];
                  newData[i].details = e.target.value;
                  setCapabilityLevels(newData);
                }}
              />
            </label>

            {/* ACTIONS editor */}
            <div className={styles.jsonSection}>
              <strong>Actions (by question ID):</strong>
                {Object.entries(c.actions || {}).length === 0 ? (
                <div className={styles.noContent}>No content</div>
                ) : (
                Object.entries(c.actions!).map(([qid, actionsList]) => (
                    <div key={qid} className={styles.subBlock}>
                    <div className={styles.greyLabel}>{qid}</div>
                    {(actionsList || []).map((action, aIndex) => (
                        <div key={aIndex} className={styles.listItem}>
                        <input
                            value={action}
                            onChange={(e) => {
                            const newData = [...capabilityLevels];
                            newData[i].actions[qid][aIndex] = e.target.value;
                            setCapabilityLevels(newData);
                            }}
                        />
                        <button
                            onClick={() => {
                            const newData = [...capabilityLevels];
                            newData[i].actions[qid].splice(aIndex, 1);
                            setCapabilityLevels(newData);
                            }}
                        >
                            −
                        </button>
                        </div>
                    ))}
                    <button
                        className={styles.addBtn}
                        onClick={() => {
                        const newData = [...capabilityLevels];
                        if (!newData[i].actions[qid]) newData[i].actions[qid] = [];
                        newData[i].actions[qid].push("");
                        setCapabilityLevels(newData);
                        }}
                    >
                        + Add Action
                    </button>
                    </div>
                ))
                )}

            </div>

            {/* FAIR SERVICES editor */}
            <div className={styles.jsonSection}>
              <strong>Fair Services:</strong>
                {!c.fair_services?.fair_services || c.fair_services.fair_services.length === 0 ? (
                <div className={styles.noContent}>No content</div>
                ) : (
                c.fair_services.fair_services.map((service, sIndex) => (
                    <div key={sIndex} className={styles.listItem}>
                    <input
                        value={service}
                        onChange={(e) => {
                        const newData = [...capabilityLevels];
                        newData[i].fair_services.fair_services[sIndex] = e.target.value;
                        setCapabilityLevels(newData);
                        }}
                    />
                    <button
                        onClick={() => {
                        const newData = [...capabilityLevels];
                        newData[i].fair_services.fair_services.splice(sIndex, 1);
                        setCapabilityLevels(newData);
                        }}
                    >
                        −
                    </button>
                    </div>
                ))
                )}

              <button
                className={styles.addBtn}
                onClick={() => {
                  const newData = [...capabilityLevels];
                  newData[i].fair_services.fair_services.push("");
                  setCapabilityLevels(newData);
                }}
              >
                + Add Service
              </button>
            </div>

            {/* LEVEL ACTIONS editor */}
            <div className={styles.jsonSection}>
              <strong>Level Actions:</strong>
              {!c.level_actions || c.level_actions.length === 0 ? (
                <div className={styles.noContent}>No content</div>
                ) : (
                c.level_actions.map((la, lIndex) => (
                    <div key={lIndex} className={styles.listItem}>
                    <input
                        value={la}
                        onChange={(e) => {
                        const newData = [...capabilityLevels];
                        newData[i].level_actions[lIndex] = e.target.value;
                        setCapabilityLevels(newData);
                        }}
                    />
                    <button
                        onClick={() => {
                        const newData = [...capabilityLevels];
                        newData[i].level_actions.splice(lIndex, 1);
                        setCapabilityLevels(newData);
                        }}
                    >
                        −
                    </button>
                    </div>
                ))
                )}

              <button
                className={styles.addBtn}
                onClick={() => {
                  const newData = [...capabilityLevels];
                  newData[i].level_actions.push("");
                  setCapabilityLevels(newData);
                }}
              >
                + Add Level Action
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <div className={styles.footer}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleUpdate} disabled={loading} className={styles.updateBtn}>
          {loading ? "Updating..." : "Update Data"}
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === "success" ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
