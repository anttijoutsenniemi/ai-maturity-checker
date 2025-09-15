"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import { supabase } from "@/app/lib/supabaseClient"
import styles from "@/styles/Profile.module.css"
import levelStyles from "@/styles/ProfileLevels.module.css"

type Topic = {
  id: number
  title: string
  dimension: string
}

type CapabilityLevel = {
  cl_short: string
  capability_level: string
  question_ids: string[]
  dimension_id: string
}

export default function AiProfilePage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [capabilityLevels, setCapabilityLevels] = useState<CapabilityLevel[]>([])
  const [currentLevels, setCurrentLevels] = useState<string[]>([])
  const [gapLevels, setGapLevels] = useState<string[]>([])
  const [priorityLevels, setPriorityLevels] = useState<string[]>([])
  const [showCurrent, setShowCurrent] = useState(true)
  const [showGap, setShowGap] = useState(true)
  const [showPriority, setShowPriority] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const username = "jaakko"

      // fetch topics
      const { data: topicsData } = await supabase.from("topics").select("id,title,dimension")
      setTopics(topicsData || [])

      // fetch capability_levels
      const { data: clData } = await supabase.from("capability_levels").select("dimension_id,cl_short,capability_level,question_ids")
      setCapabilityLevels(clData || [])

      // fetch user answers
      const { data: uaData } = await supabase.from("user_answers").select("answers").eq("username", username).single()

        // set current levels
        let completed: string[] = []
        if (uaData?.answers) {
        const parsedAnswers = typeof uaData.answers === "string"
            ? JSON.parse(uaData.answers)
            : uaData.answers

        for (const dim of parsedAnswers) {
            const answersObj = dim.answers
            for (const lvl of clData || []) {
            if (lvl.dimension_id === dim.dimension_id) {
                const allTrue = lvl.question_ids.every((qid: string) => answersObj[qid] === true)
                if (allTrue) {
                completed.push(lvl.cl_short)
                }
            }
            }
        }
        }
        setCurrentLevels(completed)


      // fetch user priorities
      const { data: priorities } = await supabase.from("user_priorities").select("priority_levels").eq("username", username).single()
      if (priorities?.priority_levels && priorities.priority_levels.length > 0) {
        setPriorityLevels(priorities.priority_levels)
      }

      // fetch gap levels from dependencies
      const { data: deps } = await supabase.from("level_dependencies").select("level,dimension")
      if (deps) {
        // naive gap logic: deps.level is a gap if not completed but is needed
        const gaps = deps
          .filter((d: any) => !completed.includes(d.level))
          .map((d: any) => d.level)
        setGapLevels(gaps)
      }
    }

    loadData()
  }, [])

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
          {topics.map((dim, idx) => {
            const dimLevels = capabilityLevels.filter((c) => c.dimension_id === dim.dimension)
            return (
              <tr key={dim.id}>
                <td>{idx + 1}</td>
                <td>{dim.title}</td>
                <td>
                  <div className={styles.levelRow}>
                    {dimLevels.map((lvl) => {
                      let colorClass = styles.levelUndefined

                      if (showCurrent && currentLevels.includes(lvl.cl_short))
                        colorClass = styles.levelCurrent
                      if (showGap && gapLevels.includes(lvl.cl_short))
                        colorClass = styles.levelGap
                      if (showPriority && priorityLevels.includes(lvl.cl_short))
                        colorClass = styles.levelPriority

                      return (
                        <div key={lvl.cl_short} className={clsx(styles.levelBlock, colorClass)}>
                          {lvl.cl_short}
                        </div>
                      )
                    })}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* New section under table */}
      <div className={levelStyles.levelBox}>
        <div className={levelStyles.section}>
          <h3>1. Completed Levels</h3>
          {capabilityLevels
            .filter((cl) => currentLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>

        <div className={levelStyles.section}>
          <h3>2. Gap Levels</h3>
          {capabilityLevels
            .filter((cl) => gapLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>

        <div className={levelStyles.section}>
          <h3>3. Priority Levels</h3>
          {capabilityLevels
            .filter((cl) => priorityLevels.includes(cl.cl_short))
            .map((cl) => (
              <div key={cl.cl_short} className={levelStyles.levelRow}>
                {cl.cl_short}, {cl.capability_level}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
