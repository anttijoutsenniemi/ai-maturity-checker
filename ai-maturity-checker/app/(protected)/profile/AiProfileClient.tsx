"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import { supabase } from "@/app/lib/supabaseClient"
import styles from "@/styles/Profile.module.css"
import levelStyles from "@/styles/ProfileLevels.module.css"
import { useStepsProgress } from "@/hooks/useSteps2"

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

export default function AiProfileClient({ email }: { email: string }) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [capabilityLevels, setCapabilityLevels] = useState<CapabilityLevel[]>([])
  const [currentLevels, setCurrentLevels] = useState<string[]>([])
  const [gapLevels, setGapLevels] = useState<string[]>([])
  const [priorityLevels, setPriorityLevels] = useState<string[]>([])
  const [showCurrent, setShowCurrent] = useState(true)
  const [showGap, setShowGap] = useState(true)
  const [showPriority, setShowPriority] = useState(true)

  const { completedSteps, completeStep } = useStepsProgress(email)

  useEffect(() => {
    if (!completedSteps.includes(3)) {
      completeStep(3)
    }

    const loadData = async () => {
      // fetch topics
      const { data: topicsData } = await supabase
        .from("topics")
        .select("id,title,dimension")
      setTopics(topicsData || [])

      // fetch capability_levels
      const { data: clData } = await supabase
        .from("capability_levels")
        .select("dimension_id,cl_short,capability_level,question_ids")
      setCapabilityLevels(clData || [])

      // fetch user answers -> determine completed/current levels
      const { data: uaData } = await supabase
        .from("user_answers")
        .select("answers")
        .eq("username", email)
        .single()

      let completed: string[] = []
      if (uaData?.answers) {
        const parsedAnswers =
          typeof uaData.answers === "string"
            ? JSON.parse(uaData.answers)
            : uaData.answers

        for (const dim of parsedAnswers) {
          const answersObj = dim.answers
          for (const lvl of clData || []) {
            if (lvl.dimension_id === dim.dimension_id) {
              const allTrue = lvl.question_ids.every(
                (qid: string) => answersObj[qid] === true
              )
              if (allTrue) {
                completed.push(lvl.cl_short)
              }
            }
          }
        }
      }
      setCurrentLevels(completed)

      // fetch user priorities -> desired levels
      const { data: priorities } = await supabase
        .from("user_priorities")
        .select("priority_dimensions")
        .eq("username", email)
        .single()

      let desired: string[] = []
      if (
        priorities?.priority_dimensions &&
        priorities.priority_dimensions.length > 0
      ) {
        desired = (clData || [])
          .filter((lvl) =>
            priorities.priority_dimensions.includes(lvl.dimension_id)
          )
          .map((lvl) => lvl.cl_short)
      }
      setPriorityLevels(desired)

      // fetch dependencies -> gap levels
      const { data: deps } = await supabase
        .from("level_dependencies")
        .select("level, dependencies")

      let gaps: string[] = []
      if (deps) {
        const needed = deps
          .filter((d: any) => desired.includes(d.level))
          .flatMap((d: any) => d.dependencies || [])

        gaps = [...new Set(needed)].filter(
          (lvl: string) => !completed.includes(lvl) && !desired.includes(lvl)
        )
      }
      setGapLevels(gaps)
    }

    loadData()
  }, [email, completedSteps, completeStep])

  return (
    <div className={styles.container}>
      {/* Toggle buttons */}
      <div className={styles.toggleRow}>
        <button
          className={clsx(styles.toggleButton, showCurrent && styles.toggleActiveGreen)}
          onClick={() => setShowCurrent(!showCurrent)}
        >
          1. Show current levels
        </button>
        <button
          className={clsx(styles.toggleButton, showGap && styles.toggleActiveLightBlue)}
          onClick={() => setShowGap(!showGap)}
        >
          2. Show gap levels
        </button>
        <button
          className={clsx(styles.toggleButton, showPriority && styles.toggleActiveDarkBlue)}
          onClick={() => setShowPriority(!showPriority)}
        >
          3. Show priority levels
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
            const dimLevels = capabilityLevels.filter(
              (c) => c.dimension_id === dim.dimension
            )
            return (
              <tr key={dim.id}>
                <td>{idx + 1}</td>
                <td>{dim.title}</td>
                <td>
                  <div className={styles.levelRow}>
                    {dimLevels.map((lvl) => {
                      let colorClass = styles.levelUndefined

                      if (showCurrent && currentLevels.includes(lvl.cl_short)) {
                        colorClass = styles.levelCurrent
                      } else if (
                        showPriority &&
                        priorityLevels.includes(lvl.cl_short)
                      ) {
                        colorClass = styles.levelPriority
                      } else if (showGap && gapLevels.includes(lvl.cl_short)) {
                        colorClass = styles.levelGap
                      }

                      return (
                        <div
                          key={lvl.cl_short}
                          className={clsx(styles.levelBlock, colorClass)}
                        >
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
