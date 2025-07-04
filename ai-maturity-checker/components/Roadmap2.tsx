'use client'

import { useEffect, useState } from 'react'
import styles from '@/styles/Roadmap2.module.css'
import { ChevronDown, ChevronUp } from 'lucide-react'

type FairServicesFormat = {
  fair_services?: string[]
  [questionId: string]: string[] | undefined
}

export interface CapabilityLevel {
  id: string
  dimension_id: string
  cl_short: string
  capability_level: string
  question_ids: string[]
  inserted_at: string
  details?: string
  activities?: Record<string, string[]>
  actions?: Record<string, string[]>
  fair_services?: FairServicesFormat
  level_actions?: string[]
}

type UserAnswers = {
  dimension_id: string
  notes: string
  answers: { [questionId: string]: boolean }
}

type RoadmapProps = {
  levels: CapabilityLevel[]
  userAnswers: UserAnswers[]
}

export default function Roadmap2({ levels, userAnswers }: RoadmapProps) {
  const [steps, setSteps] = useState<
    {
      id: string
      cl_short: string
      capability_level: string
      notDoneActions: string[]
      fairServices: string[]
      levelActions: string[]
      isCompleted: boolean
    }[]
  >([])

  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({})

  useEffect(() => {
    const mergedSteps = levels.map((level) => {
      const userAnswerForDim = userAnswers.find(
        (ua) => ua.dimension_id === level.dimension_id
      )

      const userAnsweredYes: string[] = userAnswerForDim
        ? Object.entries(userAnswerForDim.answers)
            .filter(([_, val]) => val)
            .map(([qid]) => qid)
        : []

      const notDoneQIds = level.question_ids.filter(
        (qid) => !userAnsweredYes.includes(qid)
      )

      const notDoneActions = notDoneQIds
        .flatMap((qid) => level.actions?.[qid] || [])
        .filter(Boolean)

      let allFairServices: string[] = []
      if (level.fair_services && typeof level.fair_services === 'object') {
        notDoneQIds.forEach((qid) => {
          const perQFair = level.fair_services?.[qid]
          if (Array.isArray(perQFair)) {
            allFairServices.push(...perQFair)
          }
        })

        const globalFair = level.fair_services.fair_services
        if (Array.isArray(globalFair)) {
          allFairServices.push(...globalFair)
        }
      }

      const isCompleted = notDoneActions.length === 0

      return {
        id: level.id,
        cl_short: level.cl_short,
        capability_level: level.capability_level,
        notDoneActions,
        fairServices: allFairServices,
        levelActions: level.level_actions || [],
        isCompleted,
      }
    })

    setSteps(mergedSteps)

    const defaultExpanded: { [id: string]: boolean } = {}
    mergedSteps.forEach((s) => {
      defaultExpanded[s.id] = !s.isCompleted
    })
    setExpanded(defaultExpanded)
  }, [levels, userAnswers])

  return (
    <div className={styles.roadmapContainer}>
      <h2 className={styles.title}>Capability Roadmap</h2>
      {steps.map((step, index) => {
        const isOpen = expanded[step.id]
        const toggle = () =>
          setExpanded((prev) => ({ ...prev, [step.id]: !prev[step.id] }))

        return (
          <div
            key={step.id}
            className={`${styles.stepBlock} ${
              step.isCompleted ? styles.completedBlock : ''
            }`}
          >
            {/* Step number + vertical line */}
            <div className={styles.stepMarker}>
              <div
                className={`${styles.circle} ${
                  step.isCompleted ? styles.completed : ''
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`${styles.verticalLine} ${
                  step.isCompleted ? styles.completed : ''
                }`}
              />
            </div>

            {/* Step content */}
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h3 className={styles.stepTitle}>{step.cl_short}</h3>
                <button className={styles.toggleBtn} onClick={toggle}>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {isOpen && (
                <div className={styles.bubblesGrid}>
                  <div className={styles.bubble}>
                    <h4>Actions</h4>
                    {step.notDoneActions.length > 0 ? (
                      <ul>
                        {step.notDoneActions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No actions for this step</p>
                    )}
                  </div>

                  <div className={styles.bubble}>
                    <h4>FAIR Services</h4>
                    {step.fairServices.length > 0 ? (
                      <ul>
                        {step.fairServices.map((fs, i) => (
                          <li key={i}>{fs}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No services for this step</p>
                    )}
                  </div>

                  <div className={styles.bubble}>
                    <h4>Level Actions</h4>
                    {step.levelActions.length > 0 ? (
                      <ul>
                        {step.levelActions.map((la, i) => (
                          <li key={i}>{la}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No level actions for this step</p>
                    )}
                  </div>

                  <div className={styles.bubble}>
                    <button className={styles.redirectButton}>
                      Go to Questions →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
