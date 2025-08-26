import { createClient as createUpdateClient } from '@/utils/supabase/server' // Renamed
import { NextResponse as NextResponseUpdate } from 'next/server' // Renamed

export async function POST_UPDATE_ORDER(request: Request) { // Renamed
  const { id, status } = await request.json()
  const supabase = createUpdateClient()
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select()
  if (error) { return NextResponseUpdate.json({ error: error.message }, { status: 500 }) }
  return NextResponseUpdate.json({ data })
}