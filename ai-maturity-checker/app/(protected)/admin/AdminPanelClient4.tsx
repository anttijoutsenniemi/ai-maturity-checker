"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import styles from "./admin-panel.module.css";
import { ChevronRight, ChevronDown } from "lucide-react"

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
  actions: Record<string, string[]>; // { "D2-Q1": ["Action 1", "Action 2"] }
  fair_services: { fair_services: string[] };
  level_actions: string[];
};

type ChangeRecord = {
  section: "topics" | "capability_levels";
  id: string | number;
  changes: Record<string, any>;
};

export default function AdminPanelClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [capabilityLevels, setCapabilityLevels] = useState<CapabilityLevel[]>([]);
  const [password, setPassword] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [collapsedSections, setCollapsedSections] = useState({
    topics: true,
    capabilities: true,
    });
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  // Fetch initial data
useEffect(() => {
  async function fetchData() {
    try {
      const [{ data: topicsData }, { data: levelsData }] = await Promise.all([
        supabase
          .from("topics")
          .select("id, title, details, dimension")
          .order("id", { ascending: true }),

        supabase
          .from("capability_levels")
          .select("id, dimension_id, cl_short, capability_level, details, actions, fair_services, level_actions")
          .order("cl_short", { ascending: true }),
      ]);

      //  Natural sort of cl_short like D1, D2, ..., D10
      const sortedLevels = (levelsData || []).sort((a, b) => {
        const aNum = parseInt(a.cl_short.replace(/\D/g, ""), 10);
        const bNum = parseInt(b.cl_short.replace(/\D/g, ""), 10);
        return aNum - bNum;
      });

      setTopics(topicsData || []);
      setCapabilityLevels(sortedLevels);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load data: " + err.message });
    } finally {
      setFetching(false);
    }
  }

  fetchData();
}, []);


    function toggleSection(key: "topics" | "capabilities") {
    setCollapsedSections((prev) => {
        const newState = { ...prev, [key]: !prev[key] };

        // when opening the capabilities section, collapse all its blocks
        if (key === "capabilities" && prev.capabilities === true) {
        setCollapsedBlocks(() => {
            const allCollapsed: Record<string, boolean> = {};
            capabilityLevels.forEach((c) => {
            allCollapsed[c.id] = true;
            });
            return allCollapsed;
        });
        }

        return newState;
    });
    }

  function toggleCapabilityBlock(id: string) {
    setCollapsedBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Track any local field change
  function recordChange(section: "topics" | "capability_levels", id: number | string, field: string, value: any) {
    setChanges((prev) => {
      const existing = prev.find((c) => c.section === section && c.id === id);
      if (existing) {
        return prev.map((c) =>
          c.section === section && c.id === id
            ? { ...c, changes: { ...c.changes, [field]: value } }
            : c
        );
      }
      return [...prev, { section, id, changes: { [field]: value } }];
    });
  }

  async function handleUpdate() {
    if (changes.length === 0) {
      setMessage({ type: "error", text: "No changes to save." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salis: password,
          changes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage({ type: "success", text: "Changes saved successfully!" });
      setChanges([]); // reset tracked changes
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className={styles.container}>Loading data...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Panel</h1>

      {/* SECTION 1: Topics */}
    <section className={styles.section}>
    <div
        className={styles.sectionHeader}
        onClick={() => toggleSection("topics")}
    >
        {collapsedSections.topics ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        <h2>1. Dimensions</h2>
    </div>

    {!collapsedSections.topics && (
        <div className={styles.collapseContent}>
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
                  <textarea
                    value={t.title}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const newTopics = [...topics];
                      newTopics[i].title = newVal;
                      setTopics(newTopics);
                      recordChange("topics", t.id, "title", newVal);
                    }}
                  />
                </td>
                <td>
                  <textarea
                    value={t.details}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      const newTopics = [...topics];
                      newTopics[i].details = newVal;
                      setTopics(newTopics);
                      recordChange("topics", t.id, "details", newVal);
                    }}
                  />
                </td>
                <td className={styles.grey}>{t.dimension}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
    )}
    </section>

      {/* SECTION 2: Capability Levels */}
<section className={styles.section}>
  <div
    className={styles.sectionHeader}
    onClick={() => toggleSection("capabilities")}
  >
    {collapsedSections.capabilities ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
    <h2>2. Capability Levels</h2>
  </div>

  {!collapsedSections.capabilities && (
    <div className={styles.collapseContent}>
      {capabilityLevels.map((c, i) => (
        <div key={c.id} className={styles.capabilityBox}>
          <div
            className={styles.capabilityHeader}
            onClick={() => toggleCapabilityBlock(c.id)}
          >
            {collapsedBlocks[c.id] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            <h3>{c.cl_short} — {c.capability_level}</h3>
          </div>

          {!collapsedBlocks[c.id] && (
            <div className={styles.collapseContent}>
               <label>
              <strong>Capability Level:</strong>
              <textarea
                value={c.capability_level}
                onChange={(e) => {
                  const val = e.target.value;
                  const newLevels = [...capabilityLevels];
                  newLevels[i].capability_level = val;
                  setCapabilityLevels(newLevels);
                  recordChange("capability_levels", c.id, "capability_level", val);
                }}
              />
            </label>

            <label>
              <strong>Details:</strong>
              <textarea
                value={c.details}
                onChange={(e) => {
                  const val = e.target.value;
                  const newLevels = [...capabilityLevels];
                  newLevels[i].details = val;
                  setCapabilityLevels(newLevels);
                  recordChange("capability_levels", c.id, "details", val);
                }}
              />
            </label>

            {/* ACTIONS editor */}
            <div className={styles.jsonSection}>
              <strong>Actions:</strong>
              {Object.entries(c.actions || {}).map(([qid, list]) => (
                <div key={qid} className={styles.subBlock}>
                  <div className={styles.greyLabel}>{qid}</div>
                  {list.map((action, aIdx) => (
                    <div key={aIdx} className={styles.listItem}>
                      <input
                        value={action}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newLevels = [...capabilityLevels];
                          newLevels[i].actions[qid][aIdx] = val;
                          setCapabilityLevels(newLevels);
                          recordChange("capability_levels", c.id, "actions", newLevels[i].actions);
                        }}
                      />
                      <button
                        onClick={() => {
                          const newLevels = [...capabilityLevels];
                          newLevels[i].actions[qid].splice(aIdx, 1);
                          setCapabilityLevels(newLevels);
                          recordChange("capability_levels", c.id, "actions", newLevels[i].actions);
                        }}
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <button
                    className={styles.addBtn}
                    onClick={() => {
                      const newLevels = [...capabilityLevels];
                      newLevels[i].actions[qid].push("");
                      setCapabilityLevels(newLevels);
                      recordChange("capability_levels", c.id, "actions", newLevels[i].actions);
                    }}
                  >
                    + Add Action
                  </button>
                </div>
              ))}
            </div>

            {/* FAIR SERVICES editor */}
            <div className={styles.jsonSection}>
              <strong>Fair Services:</strong>
              {(c.fair_services?.fair_services || []).map((srv, sIdx) => (
                <div key={sIdx} className={styles.listItem}>
                  <input
                    value={srv}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newLevels = [...capabilityLevels];
                      newLevels[i].fair_services.fair_services[sIdx] = val;
                      setCapabilityLevels(newLevels);
                      recordChange("capability_levels", c.id, "fair_services", newLevels[i].fair_services);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newLevels = [...capabilityLevels];
                      newLevels[i].fair_services.fair_services.splice(sIdx, 1);
                      setCapabilityLevels(newLevels);
                      recordChange("capability_levels", c.id, "fair_services", newLevels[i].fair_services);
                    }}
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                className={styles.addBtn}
                onClick={() => {
                  const newLevels = [...capabilityLevels];
                  newLevels[i].fair_services.fair_services.push("");
                  setCapabilityLevels(newLevels);
                  recordChange("capability_levels", c.id, "fair_services", newLevels[i].fair_services);
                }}
              >
                + Add Service
              </button>
            </div>

            {/* LEVEL ACTIONS editor */}
            <div className={styles.jsonSection}>
              <strong>Level Actions:</strong>
              {(c.level_actions || []).map((la, lIdx) => (
                <div key={lIdx} className={styles.listItem}>
                  <input
                    value={la}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newLevels = [...capabilityLevels];
                      newLevels[i].level_actions[lIdx] = val;
                      setCapabilityLevels(newLevels);
                      recordChange("capability_levels", c.id, "level_actions", newLevels[i].level_actions);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newLevels = [...capabilityLevels];
                      newLevels[i].level_actions.splice(lIdx, 1);
                      setCapabilityLevels(newLevels);
                      recordChange("capability_levels", c.id, "level_actions", newLevels[i].level_actions);
                    }}
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                className={styles.addBtn}
                onClick={() => {
                  const newLevels = [...capabilityLevels];
                  newLevels[i].level_actions.push("");
                  setCapabilityLevels(newLevels);
                  recordChange("capability_levels", c.id, "level_actions", newLevels[i].level_actions);
                }}
              >
                + Add Level Action
              </button>
            </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
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
          {loading ? "Updating..." : "Save Changes"}
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
