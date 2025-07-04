'use client'

import { useState, useEffect } from 'react'
import styles from '@/styles/Roadmap.module.css'
import classNames from 'classnames'

type FairServicesFormat = {
    fair_services?: string[];
    [questionId: string]: string[] | undefined;
  };
  
  export interface CapabilityLevel {
    id: string;
    dimension_id: string;
    cl_short: string;
    capability_level: string;
    question_ids: string[];
    inserted_at: string;
    details?: string;
    activities?: Record<string, string[]>;
    actions?: Record<string, string[]>;
    fair_services?: FairServicesFormat;
    level_actions?: string[];
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

export default function Roadmap({ levels, userAnswers }: RoadmapProps) {
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
  
      // QIDs that have not been answered "yes"
      const notDoneQIds = level.question_ids.filter(
        (qid) => !userAnsweredYes.includes(qid)
      )
  
      // Collect actions from unanswered QIDs
      const notDoneActions = notDoneQIds
        .flatMap((qid) => level.actions?.[qid] || [])
        .filter(Boolean)
  
      // ✅ Normalize fair_services
      let allFairServices: string[] = []
  
      if (level.fair_services && typeof level.fair_services === 'object') {
        // Per-question fair services
        notDoneQIds.forEach((qid) => {
          const perQFair = level.fair_services?.[qid]
          if (Array.isArray(perQFair)) {
            allFairServices.push(...perQFair)
          }
        })
  
        // Global fair_services field
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
  }, [levels, userAnswers])
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Capability Roadmap</h2>
      <div className={styles.roadmap}>
        {steps.map((step, index) => {
          const isTurn = index % 2 === 1
          const completed = step.isCompleted

          return (
            <div
              key={step.id}
              className={classNames(styles.stepContainer, {
                [styles.reverse]: isTurn,
              })}
            >
              <div
                className={classNames(styles.ball, {
                  [styles.completed]: completed,
                })}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
              </div>

              <div className={styles.bubbles}>
                <div className={styles.bubble}>
                  <h4>Actions</h4>
                  <ul>
                    {step.notDoneActions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.bubble}>
                  <h4>Fair Services</h4>
                  <ul>
                    {step.fairServices.map((fs, i) => (
                      <li key={i}>{fs}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.bubble}>
                  <h4>Level Action</h4>
                  <ul>
                    {step.levelActions.map((la, i) => (
                      <li key={i}>{la}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.bubble}>
                  <button className={styles.redirectButton}>
                    Go to Questions →
                  </button>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={classNames(styles.line, {
                    [styles.verticalTurn]: (index + 1) % 2 === 0,
                  })}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
