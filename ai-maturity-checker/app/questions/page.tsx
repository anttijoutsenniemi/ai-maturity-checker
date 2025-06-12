'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import styles from '@/styles/QuestionsPage.module.css';

export default function MainPage() {
  const [dimensions, setDimensions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDimensions = async () => {
      const { data, error } = await supabase
        .from('Questions')
        .select('dimension');

      if (error) {
        console.error('Failed to fetch dimensions:', error.message);
        return;
      }

      const dims = Array.from(
        new Set(data.map((q) => q.dimension.split('-')[0])) // ['D1', 'D2', ...]
      ).sort();

      setDimensions(dims);
    };

    fetchDimensions();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Questionnaires</h1>
      <div className={styles.buttonList}>
        {dimensions.map((dim) => (
          <Link href={`/dimension/${dim}`} key={dim} className={styles.button}>
            {`Dimension ${dim.slice(1)} Questionnaire`}
          </Link>
        ))}
      </div>
    </div>
  );
}
