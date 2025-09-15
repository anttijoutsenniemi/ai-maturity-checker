'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import styles from '@/styles/Progress.module.css';
import classNames from 'classnames';

type Question = {
  id: string;
  dimension: string;
};

type AnswerEntry = {
  dimension_id: string;
  notes: string;
  answers: { [questionId: string]: boolean };
};

export default function ProgressSection() {
  const [dimensions, setDimensions] = useState<{ dimension: string; total: number }[]>([]);
  const [userAnswers, setUserAnswers] = useState<AnswerEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('Questions')
        .select('id, dimension');

      if (questionsError) {
        console.error('Failed to fetch questions:', questionsError.message);
        return;
      }

      // Group questions by dimension
      const dimensionMap: { [dim: string]: number } = {};
      questionsData.forEach((q: Question) => {
        const dim = q.dimension.split('-')[0]; // Normalize if needed
        dimensionMap[dim] = (dimensionMap[dim] || 0) + 1;
      });

      const allDimensions = Object.keys(dimensionMap)
        .sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''));
          const numB = parseInt(b.replace(/\D/g, ''));
          return numA - numB;
        })
        .map((dim) => ({ dimension: dim, total: dimensionMap[dim] }));

      setDimensions(allDimensions);

      // 2. Fetch latest user answers
      const { data: answersData, error: answersError } = await supabase
        .from('user_answers')
        .select('answers')
        .eq('username', 'jaakko') // TODO: replace with real user logic
        .order('created_at', { ascending: false })
        .limit(1);

      if (answersError) {
        console.error('Failed to fetch user answers:', answersError.message);
        return;
      }

      if (answersData && answersData[0]) {
        // ✅ answers is actually an array of { dimension_id, answers }
        setUserAnswers(answersData[0].answers || []);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Progress in answering questions</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Answered yes</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map(({ dimension, total }) => {
            // Find user answers for this dimension
            const userDim = userAnswers.find((ua) => ua.dimension_id === dimension);

            const yesCount = userDim
              ? Object.values(userDim.answers).filter((a) => a).length
              : 0;

            const percent = total > 0 ? Math.round((yesCount / total) * 100) : 0;

            return (
              <tr key={dimension}>
                <td className={styles.dimension}>{dimension}</td>
                <td>
                  {yesCount} / {total}
                </td>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
