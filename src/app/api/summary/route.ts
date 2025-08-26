import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // The createClient function now requires no arguments.
  // It handles cookies internally.
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('status, charge')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const summary = {
    total_orders: data.length,
    total_charge: data.reduce((acc, order) => acc + (order.charge || 0), 0),
    processing_orders: data.filter(order => order.status === 'processing' || order.status === 'in_progress' || order.status === 'Pending').length,
    completed_orders: data.filter(order => order.status === 'completed').length,
  }

  return NextResponse.json(summary)
}
