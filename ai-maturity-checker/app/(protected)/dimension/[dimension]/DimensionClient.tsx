'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Conversation from '@/components/Conversation4';
import styles from '@/styles/Dimensionpage.module.css';

interface Question {
  id: string;
  question: string;
  answers: { text: string }[];
}

interface Props {
  email?: string;
  dimension?: string;
  questions?: Question[];
  nextExists?: boolean;
  totalDimensions?: number;
}

export default function DimensionClient({
  email,
  dimension,
  questions,
  nextExists,
  totalDimensions,
}: Props) {
  const router = useRouter();

  if(!email || !dimension || !questions || !nextExists || !totalDimensions){
    return <div>no props</div>
  }

  if (!questions?.length) {
    return (
      <div className={styles.error}>
        No questions found for this dimension.
      </div>
    );
  }

  const nextDimension = `D${parseInt(dimension.slice(1), 10) + 1}`;

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {`Dimension ${dimension.slice(1)} Questionnaire`}
        </h1>

        {/* Pass dimension, totalDimensions, and email to Conversation */}
        <Conversation
          file={{ key: dimension, data: { questions } }}
          email={email}
          totalDimensions={totalDimensions}
          dimension={dimension}
        />
      </div>

      {/* Navigation Buttons */}
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
