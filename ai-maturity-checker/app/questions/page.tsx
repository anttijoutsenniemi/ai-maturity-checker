'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import styles from '@/styles/QuestionsPage.module.css';

type DimensionInfo = {
  dimension: string;
  title: string;
};

export default function MainPage() {
  const [dimensionInfo, setDimensionInfo] = useState<DimensionInfo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Step 1: Get distinct dimensions from Questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('Questions')
        .select('dimension');

      if (questionsError) {
        console.error('Failed to fetch dimensions:', questionsError.message);
        return;
      }

      const uniqueDimensions = Array.from(
        new Set(questionsData.map((q) => q.dimension.split('-')[0]))
      ).sort();

      // Step 2: Fetch corresponding topic titles from Topics table
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('dimension, title')
        .in('dimension', uniqueDimensions);

      if (topicsError) {
        console.error('Failed to fetch topics:', topicsError.message);
        return;
      }

      // Step 3: Merge the two based on matching dimension
      const merged: DimensionInfo[] = uniqueDimensions.map((dim) => {
        const topic = topicsData.find((t) => t.dimension === dim);
        return {
          dimension: dim,
          title: topic?.title ?? `Untitled (${dim})`
        };
      });

      setDimensionInfo(merged);
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Questionnaires</h1>
      <div className={styles.buttonList}>
        {dimensionInfo.map(({ dimension, title }) => (
          <div key={dimension} className={styles.buttonGroup}>
            <p className={styles.topicTitle}>{title}</p>
            <Link href={`/dimension/${dimension}`} className={styles.button}>
              {`Start answering D${dimension.slice(1)} questions`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
