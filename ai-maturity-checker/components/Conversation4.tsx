'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { useDimensionsProgress } from '@/hooks/useDimensions';
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const params = useParams();
  const dimension = params?.dimension?.toString().toUpperCase() || 'D1';
  const { completeDimension } = useDimensionsProgress("jaakko");

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
    if (editingIndex === null) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    else{
      setEditingIndex(null);
    }
  }, [conversation, showSummary]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
  
    const username = 'jaakko';
    if (!username) {
      setSaveStatus('Username not found.');
      setSaving(false);
      return;
    }
    console.log('Conversation before saving:', conversation);
    // const answers: Record<string, boolean> = {};
    // conversation.forEach((qa) => {
    //   if (qa.selectedAnswer) {
    //     const questionKey = `${dimension}-${qa.question.id}`;
    //     answers[questionKey] = qa.selectedAnswer.toLowerCase() === 'yes';
    //   }
    // });
    const answers: Record<string, boolean> = {};
    conversation.forEach((qa, index) => {
      if (qa.selectedAnswer) {
        const questionKey = `${dimension}-Q${index + 1}`;
        answers[questionKey] = qa.selectedAnswer.toLowerCase() === 'yes';
      }
    });
    
    console.log('Answers to be saved:', answers);
  
    const newDimensionData = {
      dimension_id: dimension,
      notes: extraInfo,
      answers,
    };
  
    // Try to find existing row by username
    const { data: existingRow, error: fetchError } = await supabase
      .from('user_answers')
      .select('id, answers')
      .eq('username', username)
      .single();
  
    if (fetchError && fetchError.code !== 'PGRST116') {
      setSaveStatus(`Fetch error: ${fetchError.message}`);
      setSaving(false);
      return;
    }
  
    if (existingRow) {
      // Update the dimension inside the existing answers
      const updatedAnswers = Array.isArray(existingRow.answers)
        ? existingRow.answers.filter((d: any) => d.dimension_id !== dimension)
        : [];
  
      updatedAnswers.push(newDimensionData);
  
      const { error: updateError } = await supabase
        .from('user_answers')
        .update({
          answers: updatedAnswers,
          updated_at: new Date(),
        })
        .eq('id', existingRow.id);
  
      setSaveStatus(updateError ? `Error: ${updateError.message}` : 'Saved!');
    } else {
      // Insert new row
      const { error: insertError } = await supabase
        .from('user_answers')
        .insert([
          {
            username,
            answers: [newDimensionData],
          },
        ]);
  
      setSaveStatus(insertError ? `Error: ${insertError.message}` : 'Saved!');
    }
    completeDimension(dimension);
    setSaving(false);
  };
  

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
            {conversation.map((qa, index) => (
              <div key={qa.path} className={styles.qaItem}>
                <h4 className={styles.qaQuestion}>{qa.question.question}</h4>
                {/* sd */}
                {editingIndex === index ? (
                <div className={styles.answersContainer}>
                  <button
                    className={styles.gradient_button}
                    onClick={() => {
                      const updated = [...conversation];
                      updated[index].selectedAnswer = 'Yes';
                      setConversation(updated);
                      setEditingIndex(null);
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className={styles.gradient_button}
                    onClick={() => {
                      const updated = [...conversation];
                      updated[index].selectedAnswer = 'No';
                      setConversation(updated);
                    }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.qaAnswer}>{qa.selectedAnswer}</div>
                  <button
                    className={styles.editButton}
                    onClick={() => setEditingIndex(index)}
                  >
                    Edit
                  </button>
                </>
              )}

                {/* <div className={styles.qaAnswer}>{qa.selectedAnswer}</div> */}
                {/* sd */}
              </div>
            ))}
          </div>

          {extraInfo && (
            <>
              <h3 className={styles.extraInfoTitle}>Additional info:</h3>
              <p className={styles.extraInfoContent}>{extraInfo}</p>
            </>
          )}
                      <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save answers'}
            </button>

            {saveStatus && <div className={styles.saveStatus}>{saveStatus}</div>}
        </div>
      )}
    </div>
  );
}
