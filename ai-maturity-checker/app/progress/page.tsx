'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import styles from '@/styles/Progress.module.css'
import classNames from 'classnames'

type AnswerEntry = {
  dimension_id: string
  notes: string
  answers: { [questionId: string]: boolean }
}

export default function ProgressPage() {
  const [userAnswers, setUserAnswers] = useState<AnswerEntry[]>([])

  useEffect(() => {
    const fetchAnswers = async () => {
      const { data, error } = await supabase
        .from('user_answers')
        .select('answers')
        .eq('username', 'jaakko') // TODO: replace with real user logic
        .order('created_at', { ascending: false })
        .limit(1)
  
      if (error) console.error(error)
      if (data && data[0]) {
        console.log('Fetched answers:', data[0].answers);
        setUserAnswers(data[0].answers) // ✅ already an object, no need to parse
      }
    }
  
    fetchAnswers()
  }, [])
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Progress in answering questions</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Answered yes</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
        {userAnswers
            .sort((a, b) => {
                const aNum = parseInt(a.dimension_id.replace(/\D/g, '')) // Extract number from "D1"
                const bNum = parseInt(b.dimension_id.replace(/\D/g, ''))
                return aNum - bNum
            })
            .map((entry) => {
                const total = Object.keys(entry.answers).length
                const yesCount = Object.values(entry.answers).filter((a) => a).length
                const percent = Math.round((yesCount / total) * 100)

                return (
                <tr key={entry.dimension_id}>
                    <td className={styles.dimension}>{entry.dimension_id}</td>
                    <td>{yesCount} / {total}</td>
                    <td>
                    <div className={styles.progressBarWrapper}>
                        <div
                        className={classNames(styles.progressBarFill, {
                            [styles.complete]: percent === 100,
                        })}
                        style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className={styles.percentText}>{percent}%</span>
                    </td>
                </tr>
                )
            })}

        </tbody>
      </table>
    </div>
  )
}
