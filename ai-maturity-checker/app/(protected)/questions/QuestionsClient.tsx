'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/QuestionsPage.module.css';
import ProgressSection from '@/components/ProgressSection';

type DimensionInfo = {
  dimension: string;
  title: string;
};

type ProgressData = {
  dimension: string;
  total: number;
  answeredYes: number;
  answeredCount: number;
  percent: number;
};

type Props = {
  email: string;
  dimensionInfo: DimensionInfo[];
  progressData: ProgressData[];
};

export default function QuestionsPage({ email, dimensionInfo = [], progressData = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Collapsible Progress Section */}
      <div className={styles.collapsible}>
        <button
          className={styles.collapsibleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide Progress ▲' : 'Show Progress ▼'}
        </button>
        {isOpen && (
          <div className={styles.collapsibleContent}>
            <ProgressSection progressData={progressData} />
          </div>
        )}
      </div>

      <h1 className={styles.title}>1. Available Questionnaires</h1>

      <div className={styles.buttonList}>
        {dimensionInfo?.map(({ dimension, title }) => (
          <div key={dimension} className={styles.buttonGroup}>
            <p className={styles.topicTitle}>{title}</p>
            <Link
              href={`/dimension/${dimension}`}
              className={styles.button}
            >
              {`Start answering D${dimension.slice(1)} questions`}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
