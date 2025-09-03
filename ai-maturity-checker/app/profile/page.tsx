"use client"

import { useState } from "react"
import clsx from "clsx"
import styles from "@/styles/Profile.module.css";

// mock data: replace with API call from Supabase
const dimensions = [
  {
    number: 1,
    name: "AI models usage, development, deployment and maintenance",
    levels: ["D1-L0", "D1-L1", "D1-L2", "D1-L3", "D1-L4"]
  },
  {
    number: 2,
    name: "Data management processes",
    levels: ["D2-L0", "D2-L1", "D2-L2", "D2-L3"]
  },
  {
    number: 3,
    name: "Co-creation of AI system",
    levels: ["D3-L0", "D3-L1", "D3-L2"]
  }
  // … add all 10 here
]

export default function AiProfilePage() {
  const [showCurrent, setShowCurrent] = useState(true)
  const [showGap, setShowGap] = useState(true)
  const [showPriority, setShowPriority] = useState(true)

  // in real app, load from Supabase
  const [userPriorities] = useState<string[]>(["D1-L2", "D5-L2"])
  const [currentLevels] = useState<string[]>(["D1-L1", "D2-L1", "D4-L2"])
  const [gapLevels] = useState<string[]>(["D1-L2", "D2-L2", "D5-L2"])

  return (
    <div className={styles.container}>
      {/* Toggle buttons */}
      <div className={styles.toggleRow}>
        <button
          className={clsx(styles.toggleButton, showCurrent && styles.toggleActiveGreen)}
          onClick={() => setShowCurrent(!showCurrent)}
        >
          Show current levels
        </button>
        <button
          className={clsx(styles.toggleButton, showGap && styles.toggleActiveLightBlue)}
          onClick={() => setShowGap(!showGap)}
        >
          Show gap levels
        </button>
        <button
          className={clsx(styles.toggleButton, showPriority && styles.toggleActiveDarkBlue)}
          onClick={() => setShowPriority(!showPriority)}
        >
          Show priority levels
        </button>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Dimension</th>
            <th>AI Capability Profile</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <tr key={dim.number}>
              <td>{dim.number}</td>
              <td>{dim.name}</td>
              <td>
                <div className={styles.levelRow}>
                  {dim.levels.map((lvl) => {
                    let colorClass = styles.levelUndefined

                    if (showCurrent && currentLevels.includes(lvl))
                      colorClass = styles.levelCurrent
                    if (showGap && gapLevels.includes(lvl))
                      colorClass = styles.levelGap
                    if (showPriority && userPriorities.includes(lvl))
                      colorClass = styles.levelPriority

                    return (
                      <div key={lvl} className={clsx(styles.levelBlock, colorClass)}>
                        {lvl}
                      </div>
                    )
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
