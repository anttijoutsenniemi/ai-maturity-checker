'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/Conversation.module.css';

interface Answer {
  text: string;
  followUpQuestions?: Question[];
}

interface Question {
  id: string;
  question: string;
  answers: Answer[];
}

interface QA {
  question: Question;
  selectedAnswer?: string;
  path: string;
}

interface Props {
  file: {
    key: string;
    data: {
      questions: Question[];
    };
  };
}

export default function Conversation({ file }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [conversation, setConversation] = useState<QA[]>([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [pendingFollowUps, setPendingFollowUps] = useState<Question[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file?.data?.questions) return;
    const qs = file.data.questions;
    setQuestions(qs);
    setConversation([{ question: qs[0], path: qs[0].id }]);
  }, [file]);

  const handleAnswer = (answer: Answer, index: number) => {
    const updated = conversation.slice(0, index + 1);
    updated[index].selectedAnswer = answer.text;

    if (answer.followUpQuestions?.length) {
      const [first, ...rest] = answer.followUpQuestions;
      updated.push({ question: first, path: `${updated[index].path}.${first.id}` });
      setPendingFollowUps(rest);
    } else if (pendingFollowUps.length) {
      const [next, ...rest] = pendingFollowUps;
      updated.push({ question: next, path: `${updated[index].path}.${next.id}` });
      setPendingFollowUps(rest);
    } else {
      const rootIndex = questions.findIndex(q => q.id === conversation[0].question.id);
      const nextIndex = rootIndex + updated.filter(q => !q.path.includes('.')).length;
      const next = questions[nextIndex];
      if (next) {
        updated.push({ question: next, path: next.id });
      }
    }

    setConversation(updated);
    setShowSummary(false);
  };

  const handleBack = () => {
    const updated = [...conversation];
    updated.pop();
    if (updated.length > 0) updated[updated.length - 1].selectedAnswer = undefined;
    setConversation(updated);
    setShowSummary(false);
  };

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [conversation, showSummary]);

  return (
    <div className={styles.chatContainer} ref={containerRef}>
      {conversation.map((qa, index) => (
        <div key={qa.path} className={styles.messageGroup}>
          <div className={`${styles.chatBubble} ${styles.leftBubble}`}>
            {qa.question.question}
          </div>

          {qa.selectedAnswer && (
            <div className={`${styles.chatBubble} ${styles.rightBubble}`}>
              {qa.selectedAnswer}
            </div>
          )}

          {!qa.selectedAnswer && index === conversation.length - 1 && !showSummary && (
            <div className={styles.answersContainer}>
              {qa.question.answers.map((a) => (
                <button
                  key={a.text}
                  onClick={() => handleAnswer(a, index)}
                  className={styles.gradient_button}
                >
                  {a.text}
                </button>
              ))}
              {index > 0 && (
                <button className={styles.backButton} onClick={handleBack}>
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {conversation.length > 0 &&
        conversation.every((qa) => qa.selectedAnswer) &&
        !showSummary && (
          <div className={styles.finalInfoContainer}>
            <h2 className={styles.infoTitle}>Anything to add?</h2>
            <textarea
              placeholder="Write additional info here..."
              className={styles.extraInfoTextbox}
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
            />
            <button
              className={styles.summaryButton}
              onClick={() => setShowSummary(true)}
            >
              Show summary
            </button>
          </div>
        )}

      {showSummary && (
        <div className={styles.summaryContainer}>
          <h2 className={styles.summaryTitle}>Summary</h2>
          <div className={styles.qaList}>
            {conversation.map((qa) => (
              <div key={qa.path} className={styles.qaItem}>
                <h4 className={styles.qaQuestion}>{qa.question.question}</h4>
                <div className={styles.qaAnswer}>{qa.selectedAnswer}</div>
              </div>
            ))}
          </div>

          {extraInfo && (
            <>
              <h3 className={styles.extraInfoTitle}>Additional info:</h3>
              <p className={styles.extraInfoContent}>{extraInfo}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
