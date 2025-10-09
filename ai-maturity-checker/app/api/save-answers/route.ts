import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type AnswerPayload = {
  email: string;
  dimension: string;
  conversation: {
    questionId: string;
    selectedAnswer: string;
  }[];
  extraInfo?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: AnswerPayload = await req.json();
    const { email, dimension, conversation, extraInfo } = body;

    if (!email || !dimension || !conversation || conversation.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Transform conversation into Supabase format
    const answers: Record<string, boolean> = {};
    conversation.forEach((qa, index) => {
      if (qa.selectedAnswer) {
        const key = `${dimension}-Q${index + 1}`;
        answers[key] = qa.selectedAnswer.toLowerCase() === 'yes';
      }
    });

    const newDimensionData = {
      dimension_id: dimension,
      notes: extraInfo || '',
      answers,
    };

    // Check for existing user_answers row
    const { data: existingRow, error: fetchError } = await supabase
      .from('user_answers')
      .select('id, answers')
      .eq('username', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingRow) {
      // Update existing dimension data
      const updatedAnswers = Array.isArray(existingRow.answers)
        ? existingRow.answers.filter((d: any) => d.dimension_id !== dimension)
        : [];
      updatedAnswers.push(newDimensionData);

      const { error: updateError } = await supabase
        .from('user_answers')
        .update({ answers: updatedAnswers, updated_at: new Date() })
        .eq('id', existingRow.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Saved!' });
    } else {
      // Insert new row
      const { error: insertError } = await supabase
        .from('user_answers')
        .insert([{ username: email, answers: [newDimensionData] }]);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Saved!' });
    }
  } catch (err: any) {
    console.error('Error in /save-answers', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
