import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: summary, error } = await supabase.from('orders').select('status, amount')
  if (error) { 
    return NextResponse.json({ error: error.message }, { status: 500 }) 
  }
  const initialState = {
    pending: { count: 0, total: 0 },
    processing: { count: 0, total: 0 },
    completed: { count: 0, total: 0 },
    cancelled: { count: 0, total: 0 },
    error: { count: 0, total: 0 },
  }
  const summaryData = summary.reduce((acc, order) => {
    const status = order.status.toLowerCase()
    if (acc[status as keyof typeof acc]) {
      acc[status as keyof typeof acc].count += 1
      acc[status as keyof typeof acc].total += order.amount
    }
    return acc
  }, initialState)
  return NextResponse.json({ data: summaryData })
}