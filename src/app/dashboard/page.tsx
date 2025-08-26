import { createClient } from '@/utils/supabase/server'
import OrderTable from '@/components/OrderTable'
import { Order } from '@/types'

async function getOrders(): Promise<Order[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false })
  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  return data || []
}

async function getSummary() {
  const supabase = createClient()
  const { data: summary, error } = await supabase
    .from('orders')
    .select('status, amount')

  if (error) {
    console.error('Error fetching summary:', error)
    return {
      pending: { count: 0, total: 0 },
      processing: { count: 0, total: 0 },
      completed: { count: 0, total: 0 },
      cancelled: { count: 0, total: 0 },
      error: { count: 0, total: 0 },
    }
  }

  const initialState = {
    pending: { count: 0, total: 0 },
    processing: { count: 0, total: 0 },
    completed: { count: 0, total: 0 },
    cancelled: { count: 0, total: 0 },
    error: { count: 0, total: 0 },
  }

  const summaryData = summary.reduce((acc, order) => {
    const status = order.status.toLowerCase();
    if (acc[status as keyof typeof acc]) {
      acc[status as keyof typeof acc].count += 1
      acc[status as keyof typeof acc].total += order.amount
    }
    return acc
  }, initialState)

  return summaryData
}

export default async function DashboardPage() {
  const orders = await getOrders()
  const summary = await getSummary()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(summary).map(([status, data]) => (
          <div key={status} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold capitalize">{status}</h2>
            <p className="text-2xl font-bold">{data.count}</p>
            <p className="text-gray-500">Total: ${data.total.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <OrderTable orders={orders} />
    </div>
  )
}
