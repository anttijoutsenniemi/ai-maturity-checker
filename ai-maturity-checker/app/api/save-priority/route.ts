export const dynamic = "force-dynamic";
import "server-only";
import { NextResponse } from 'next/server'
import { supabase } from "@/app/lib/supabaseClient";


export async function POST(req: Request) {
  try {
    const { username, priority_dimensions, priority_levels } = await req.json()

    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 })
    }

    // overwrite or insert
    const { data, error } = await supabase
      .from('user_priorities')
      .upsert(
        {
          username,
          priority_dimensions: priority_dimensions || [],
          priority_levels: priority_levels || []
        },
        { onConflict: 'username' }
      )
      .select()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
