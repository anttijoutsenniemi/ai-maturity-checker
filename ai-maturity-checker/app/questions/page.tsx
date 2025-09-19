'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import styles from '@/styles/QuestionsPage.module.css';
import ProgressSection from '@/components/ProgressSection'; //moved ProgressPage into a reusable component

type DimensionInfo = {
  dimension: string;
  title: string;
};

export default function MainPage() {
  const [dimensionInfo, setDimensionInfo] = useState<DimensionInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: questionsData, error: questionsError } = await supabase
        .from('Questions')
        .select('dimension');

      if (questionsError) {
        console.error('Failed to fetch dimensions:', questionsError.message);
        return;
      }

      const uniqueDimensions = Array.from(
        new Set(questionsData.map((q) => q.dimension.split('-')[0]))
      ).sort((a, b) => {
        const numA = parseInt(a.slice(1), 10);
        const numB = parseInt(b.slice(1), 10);
        return numA - numB;
      });

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('dimension, title')
        .in('dimension', uniqueDimensions);

      if (topicsError) {
        console.error('Failed to fetch topics:', topicsError.message);
        return;
      }

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
      {/* Collapsible Section */}
      <div className={styles.collapsible}>
        <button
          className={styles.collapsibleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide Progress ▲' : 'Show Progress ▼'}
        </button>
        {isOpen && (
          <div className={styles.collapsibleContent}>
            <ProgressSection /> {/*  real progress component */}
          </div>
        )}
      </div>

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
