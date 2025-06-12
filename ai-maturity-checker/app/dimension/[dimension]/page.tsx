'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import Conversation from '@/components/Conversation4';
import styles from '@/styles/Dimensionpage.module.css'; 

interface Question {
  id: string;
  question: string;
  answers: { text: string }[];
}

export default function DimensionPage() {
  const params = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const dimension = params?.dimension?.toString().toUpperCase() || 'D1'; // e.g., "1" => "D1"

  useEffect(() => {
    if (!dimension) return;

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('Questions')
        .select('*')
        .ilike('dimension', `${dimension}-%`)
        .order('dimension', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error.message);
        setLoading(false);
        return;
      }

      const mapped = data.map((q) => ({
        id: q.id,
        question: q.question,
        answers: q.answers.map((text: string) => ({ text })),
      }));

      setQuestions(mapped);
      setLoading(false);
    };

    fetchQuestions();
  }, [dimension]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (questions.length === 0) return <div className={styles.error}>No questions found for this dimension.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{`Dimension ${dimension?.slice(1)} Questionnaire`}</h1>
      <Conversation file={{ key: dimension, data: { questions } }} />
    </div>
  );
}
