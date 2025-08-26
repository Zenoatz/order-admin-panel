import { createClient as createPermjaiClient } from '@/utils/supabase/server' // Renamed
import { NextResponse as NextResponsePermjai } from 'next/server' // Renamed

export async function POST_UPDATE_PERMJAI(request: Request) { // Renamed
  const { id, permjai_status } = await request.json()
  const supabase = createPermjaiClient()
  const { data, error } = await supabase.from('orders').update({ permjai_status }).eq('id', id).select()
  if (error) { return NextResponsePermjai.json({ error: error.message }, { status: 500 }) }
  return NextResponsePermjai.json({ data })
}