'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import styles from '@/styles/results.module.css'
import { useStepsProgress } from '@/hooks/useSteps2'
import classNames from 'classnames'

type Topic = {
  id: number
  title: string
  dimension: string
}

type CapabilityLevel = {
  dimension_id: string
  cl_short: string
  capability_level: string
  question_ids: string[]
}

type AnswerEntry = {
  dimension_id: string
  notes: string
  answers: { [questionId: string]: boolean }
}

type UserLevelProgress = {
  [dimension: string]: {
    [level: string]: number
  }
}

export default function ResultsPage({email}: {email : string}) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [capLevels, setCapLevels] = useState<CapabilityLevel[]>([])
  const [userAnswers, setUserAnswers] = useState<AnswerEntry[]>([])
  const [priorityToggles, setPriorityToggles] = useState<{ [dimension: string]: boolean }>({})

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { completeStep } = useStepsProgress(email);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: topics }, { data: levels }, { data: answers }] = await Promise.all([
        supabase.from('topics').select('*'),
        supabase.from('capability_levels').select('*'),
        supabase
          .from('user_answers')
          .select('answers')
          .eq('username', email)
          .order('created_at', { ascending: false })
          .limit(1),
      ])

      if (topics) setTopics(topics)
      if (levels) setCapLevels(levels)
      if (answers && answers[0]) setUserAnswers(answers[0].answers)
    }

    fetchData()
  }, [])

  const calculateProgress = (): UserLevelProgress => {
    const progress: UserLevelProgress = {}

    userAnswers.forEach((entry) => {
      const dim = entry.dimension_id
      const userAns = entry.answers
      const levels = capLevels.filter((cl) => cl.dimension_id === dim)
      if (!progress[dim]) progress[dim] = {}

      levels.forEach((level) => {
        const total = level.question_ids.length
        const yes = level.question_ids.filter((qid) => userAns[qid]).length
        const pct = total === 0 ? 0 : Math.round((yes / total) * 100)
        const levelNum = level.cl_short.split('-')[1]
        progress[dim][levelNum] = pct
      })
    })

    return progress
  }

  const progressMap = calculateProgress()

  const togglePriority = (dimension: string) => {
    setPriorityToggles((prev) => ({
      ...prev,
      [dimension]: !prev[dimension],
    }))
  }

  const savePriority = async () => {
    let username = email;
    const priorityDimensions = Object.keys(priorityToggles).filter(dim => priorityToggles[dim])
  
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
  
    try {
      const res = await fetch('/api/save-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          priority_dimensions: priorityDimensions
        })
      })
  
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Error saving priority')
      } else {
        setSuccessMessage('Priorities saved!')
      }
    } catch (err) {
      setErrorMessage('Network error saving priority')
    } finally {
      completeStep(2);
      setLoading(false)
    }
  }  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>2. Results & Save Priority</h1>
      <h3 className={styles.subtitle}>Save your companys priority by checking the box/boxes and clicking Save priorities</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>№</th>
              <th>Dimension</th>
              <th>Priority</th>
              {['L1', 'L2', 'L3', 'L4', 'L5'].map((level) => (
                <th key={level}>{level}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics
              .sort((a, b) => a.id - b.id)
              .map((topic) => {
                const dim = topic.dimension
                const levelProgress = progressMap[dim] || {}

                return (
                  <tr key={topic.id}>
                    <td>{topic.id}</td>
                    <td>{topic.title}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={priorityToggles[dim] || false}
                        onChange={() => togglePriority(dim)}
                      />
                    </td>
                    {['L1', 'L2', 'L3', 'L4', 'L5'].map((level) => {
                      const val = levelProgress[level] ?? 0
                      const cellClass = classNames(styles.cell, {
                        [styles.full]: val === 100,
                        [styles.partial]: val >= 50 && val < 100,
                        [styles.low]: val > 0 && val < 50,
                        [styles.empty]: val === 0,
                      })

                      return (
                        <td key={level} className={cellClass}>
                          {val}%
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <button 
        className={styles.saveButton} 
        onClick={savePriority} 
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Save Priorities'}
      </button>

      {successMessage && (
        <p style={{ color: 'green', marginTop: '8px' }}>{successMessage}</p>
      )}
      {errorMessage && (
        <p style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</p>
      )}
    </div>
  )
}
