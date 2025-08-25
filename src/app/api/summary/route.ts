import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // e.g., '8' for August
  const year = searchParams.get('year') // e.g., '2024'

  if (!month || !year) {
    return NextResponse.json(
      { error: 'Month and year are required' },
      { status: 400 }
    )
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('orders')
    .select('charge, cost, profit')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const summary = data.reduce(
    (acc, order) => {
      acc.totalSales += order.charge || 0
      acc.totalCost += order.cost || 0
      acc.totalProfit += order.profit || 0
      return acc
    },
    { totalSales: 0, totalCost: 0, totalProfit: 0 }
  )

  return NextResponse.json(summary)
}