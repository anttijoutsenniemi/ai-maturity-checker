'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import Conversation from '@/components/Conversation4';
import styles from '@/styles/Dimensionpage.module.css'; 
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  answers: { text: string }[];
}

export default function DimensionPage({ email }: { email: string }) {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextExists, setNextExists] = useState(false); // track if next dimension has questions

  const dimension = params?.dimension?.toString().toUpperCase() || 'D1';

  useEffect(() => {
    if (!dimension) return;

    const fetchQuestions = async () => {
      // current dimension questions
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

      // check if next dimension exists
      const nextDim = `D${parseInt(dimension.slice(1), 10) + 1}`;
      const { data: nextData, error: nextError } = await supabase
        .from('Questions')
        .select('id')
        .ilike('dimension', `${nextDim}-%`)
        .limit(1);

      if (nextError) {
        console.error('Error checking next dimension:', nextError.message);
        setNextExists(false);
        return;
      }

      setNextExists(!!nextData && nextData.length > 0);
    };

    fetchQuestions();
  }, [dimension]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (questions.length === 0)
    return <div className={styles.error}>No questions found for this dimension.</div>;

  const nextDimension = `D${parseInt(dimension.slice(1), 10) + 1}`;

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {`Dimension ${dimension.slice(1)} Questionnaire`}
        </h1>
        <Conversation file={{ key: dimension, data: { questions } }} email={email} />
      </div>

      {/* Navigation buttons outside container */}
      <div className={styles.navButtons}>
        <Link href="/questions" className={styles.backButton}>
          ← Back to Questions
        </Link>

        {nextExists && (
          <button
            className={styles.nextButton}
            onClick={() => router.push(`/dimension/${nextDimension}`)}
          >
            Next Dimension →
          </button>
        )}
      </div>
    </>
  );
}
