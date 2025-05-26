"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

type Question = {
  id: string;
  text: string;
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*');
      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setQuestions(data);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <main>
      <h1>Questions</h1>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>{q.text}</li>
        ))}
      </ul>
    </main>
  );
}
