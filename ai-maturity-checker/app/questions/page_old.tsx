import { supabase } from '@/app/lib/supabaseClient';
import Link from 'next/link';

export default async function Home() {
  const { data, error } = await supabase
    .from('Questions')
    .select('dimension')
    .order('dimension', { ascending: true });

  if (error) throw new Error(error.message);

  const uniqueDimensions = Array.from(new Set(data.map(q => q.dimension.split('-')[0])));

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a Questionnaire</h1>
      <div className="grid gap-4">
        {uniqueDimensions.map(dim => (
          <Link
            key={dim}
            href={`/dimension/${dim.toLowerCase()}`}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            {`Dimension ${dim.slice(1)} Questionnaire`}
          </Link>
        ))}
      </div>
    </main>
  );
}
