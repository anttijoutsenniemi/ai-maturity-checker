"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import styles from "@/styles/Recommendations.module.css"
import { useStepsProgress } from "@/hooks/useSteps2"

type CapabilityLevel = {
  cl_short: string
  capability_level: string
  dimension_id: string
  question_ids: string[]
  actions: Record<string, string[]> // keyed by question id
  fair_services: { fair_services: string[] }
  level_actions: string[]
}

type UserAnswer = {
  dimension_id: string
  answers: Record<string, boolean>
}

export default function RecommendationsPage() {
  const [gapLevels, setGapLevels] = useState<CapabilityLevel[]>([])
  const [desiredLevels, setDesiredLevels] = useState<CapabilityLevel[]>([])
  const { completedSteps, completeStep } = useStepsProgress("jaakko");

  useEffect(() => {
    //complete step for front page
    if (!completedSteps.includes(4)) {
      completeStep(4);
    }
    const loadData = async () => {
      const username = "jaakko"

      // fetch capability_levels
      const { data: clData } = await supabase
        .from("capability_levels")
        .select("dimension_id,cl_short,capability_level,question_ids,actions,fair_services,level_actions")
      const allLevels: CapabilityLevel[] = clData || []

      // fetch user answers
      const { data: uaData } = await supabase
        .from("user_answers")
        .select("answers")
        .eq("username", username)
        .single()

      let completed: string[] = []
      let userAnswers: UserAnswer[] = []

      if (uaData?.answers) {
        userAnswers = typeof uaData.answers === "string" ? JSON.parse(uaData.answers) : uaData.answers
        for (const dim of userAnswers) {
          const answersObj = dim.answers
          for (const lvl of allLevels) {
            if (lvl.dimension_id === dim.dimension_id) {
              const allTrue = lvl.question_ids.every((qid: string) => answersObj[qid] === true)
              if (allTrue) completed.push(lvl.cl_short)
            }
          }
        }
      }

      // fetch priorities
      const { data: priorities } = await supabase
        .from("user_priorities")
        .select("priority_dimensions")
        .eq("username", username)
        .single()

      const desiredShorts =
        (allLevels || [])
          .filter((lvl) => priorities?.priority_dimensions?.includes(lvl.dimension_id))
          .map((lvl) => lvl.cl_short) || []

      // fetch dependencies
      const { data: deps } = await supabase.from("level_dependencies").select("level, dependencies")

      let gapShorts: string[] = []
      if (deps) {
        const needed = deps
          .filter((d: any) => desiredShorts.includes(d.level))
          .flatMap((d: any) => d.dependencies || [])
        gapShorts = [...new Set(needed)].filter(
          (lvl: string) => !completed.includes(lvl) && !desiredShorts.includes(lvl)
        )
      }

      // Filter into capability objects
      const gapLevels = allLevels.filter((cl) => gapShorts.includes(cl.cl_short))
      const desiredLevels = allLevels.filter((cl) => desiredShorts.includes(cl.cl_short))

      // Filter actions only where user answered false
      const filterActions = (cl: CapabilityLevel) => {
        const dimAnswers = userAnswers.find((ua) => ua.dimension_id === cl.dimension_id)
        if (!dimAnswers) {
          // No answers for this dimension → treat all actions as needed
          return { actions: cl.actions, fair_services: cl.fair_services, level_actions: cl.level_actions }
        }
      
        const filtered: Record<string, string[]> = {}
        for (const qid of cl.question_ids) {
          const answered = dimAnswers.answers[qid]
          if ((answered === false || answered === undefined) && cl.actions[qid]) {
            filtered[qid] = cl.actions[qid]
          }
        }
      
        return { actions: filtered, fair_services: cl.fair_services, level_actions: cl.level_actions }
      }

      setGapLevels(
        gapLevels.map((cl) => ({
          ...cl,
          ...filterActions(cl),
        }))
      )
      setDesiredLevels(
        desiredLevels.map((cl) => ({
          ...cl,
          ...filterActions(cl),
        }))
      )
    }

    loadData()
  }, [])

  const renderTable = (levels: CapabilityLevel[]) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Capability Level</th>
          <th>Improvement Actions</th>
          <th>FAIR Services</th>
          <th>Level Specific Actions</th>
        </tr>
      </thead>
      <tbody>
        {levels.map((cl) => {
          const actionList = Object.values(cl.actions || {}).flat()
          return (
            <tr key={cl.cl_short}>
              <td>
                <strong>{cl.cl_short}</strong>
                <br />
                {cl.capability_level}
              </td>
              <td>
                {actionList.length > 0 ? (
                  <ul>
                    {actionList.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <em>No actions needed</em>
                )}
              </td>
              <td>
                {cl.fair_services?.fair_services?.length > 0 ? (
                  <ul>
                    {cl.fair_services.fair_services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {cl.level_actions?.length > 0 ? (
                  <ul>
                    {cl.level_actions.map((la) => (
                      <li key={la}>{la}</li>
                    ))}
                  </ul>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  return (
    <div className={styles.container}>
      <h1>Recommendations</h1>
      <h3>In this page you will get all the info on how to level up your companys AI skills & adoptation</h3>

      <section>
        <div className={styles.gapBox}><h2>Gap Levels</h2></div>
        {renderTable(gapLevels)}
      </section>

      <section>
        <div className={styles.desiredBox}><h2>Desired Levels</h2></div>
        {renderTable(desiredLevels)}
      </section>
    </div>
  )
}
