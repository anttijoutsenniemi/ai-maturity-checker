"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
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
  fair_services: { fair_services: string[] };
  level_actions: string[];
};

type ChangeRecord = {
  section: "topics" | "capability_levels";
  id: string | number;
  changes: Record<string, any>;
};

interface Props {
  topics?: Topic[];
  capabilityLevels?: CapabilityLevel[];
}

export default function AdminPanelClient({ topics: initialTopics, capabilityLevels: initialLevels }: Props) {
  if(!initialTopics || !initialLevels){
    return (<div>no props</div>);
  }
  
  const [topics, setTopics] = useState(initialTopics);
  const [capabilityLevels, setCapabilityLevels] = useState(initialLevels);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [collapsedSections, setCollapsedSections] = useState({ topics: true, capabilities: true });
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Toggle sections
  const toggleSection = (key: "topics" | "capabilities") => {
    setCollapsedSections((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      if (key === "capabilities" && prev.capabilities) {
        const allCollapsed: Record<string, boolean> = {};
        capabilityLevels.forEach((c) => (allCollapsed[c.id] = true));
        setCollapsedBlocks(allCollapsed);
      }
      return newState;
    });
  };

  const toggleCapabilityBlock = (id: string) => {
    setCollapsedBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Track local changes
  const recordChange = (section: "topics" | "capability_levels", id: string | number, field: string, value: any) => {
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
  };

  const handleUpdate = async () => {
    if (!changes.length) {
      setMessage({ type: "error", text: "No changes to save." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salis: password, changes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage({ type: "success", text: "Changes saved successfully!" });
      setChanges([]);
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Panel</h1>

      {/* Topics Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection("topics")}>
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

      {/* Capability Levels Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection("capabilities")}>
          {collapsedSections.capabilities ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          <h2>2. Capability Levels</h2>
        </div>
        {!collapsedSections.capabilities && (
          <div className={styles.collapseContent}>
            {capabilityLevels.map((c, i) => (
              <div key={c.id} className={styles.capabilityBox}>
                <div className={styles.capabilityHeader} onClick={() => toggleCapabilityBlock(c.id)}>
                  {collapsedBlocks[c.id] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <h3>{c.cl_short} — {c.capability_level}</h3>
                </div>

                {!collapsedBlocks[c.id] && (
                  <div className={styles.collapseContent}>
                    {/* Capability fields + Actions/Services/Level Actions editors */}
                    {/* Copy the same client code you already have here */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
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
