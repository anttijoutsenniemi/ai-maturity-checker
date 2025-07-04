import Roadmap2 from '@/components/Roadmap2'
import { supabase } from '@/app/lib/supabaseClient'

export default async function RoadmapPage() {
  const { data: levels } = await supabase.from('capability_levels').select('*')
  const { data: answersRow } = await supabase
    .from('user_answers')
    .select('*')
    .eq('username', 'jaakko')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const userAnswers = answersRow ? answersRow.answers : []

  return <Roadmap2 levels={levels || []} userAnswers={userAnswers} />
}
