'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import Conversation from './Conversation4';

interface Question {
  id: string;
  question: string;
  answers: { text: string }[];
}

export default function ConversationClient() {
  const params = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const dimension = params?.dimension?.toString().toUpperCase()!; // e.g., '1' → 'D1'

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (questions.length === 0) return <div className="p-4 text-red-600">No questions found for this dimension.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{`Dimension ${dimension?.slice(1)} Questionnaire`}</h1>
      <Conversation file={{ key: dimension, data: { questions } }} />
    </div>
  );
}
