import { createClient } from '@/utils/supabase/server'
import OrderTable from '@/components/OrderTable'
import { Order, Summary } from '@/types'

async function getOrders(): Promise<Order[]> {
  // Corrected: createClient() is called with no arguments.
  const supabase = createClient()
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false })
  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  return data || []
}

async function getSummary(): Promise<Summary> {
  // Corrected: createClient() is called with no arguments.
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('status, charge')

  if (error) {
    console.error('Error fetching summary:', error)
    return { total_orders: 0, total_charge: 0, processing_orders: 0, completed_orders: 0 }
  }

  const summary = {
    total_orders: data.length,
    total_charge: data.reduce((acc, order) => acc + (order.charge || 0), 0),
    processing_orders: data.filter(order => order.status === 'processing' || order.status === 'in_progress' || order.status === 'Pending').length,
    completed_orders: data.filter(order => order.status === 'completed').length,
  }
  return summary
}


export default async function DashboardPage() {
  const orders = await getOrders()
  const summary = await getSummary()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Total Orders</h2>
          <p className="text-2xl font-semibold">{summary.total_orders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Total Charge</h2>
          <p className="text-2xl font-semibold">${summary.total_charge.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Processing</h2>
          <p className="text-2xl font-semibold">{summary.processing_orders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Completed</h2>
          <p className="text-2xl font-semibold">{summary.completed_orders}</p>
        </div>
      </div>
      {/* --- FIX: Changed prop name from initialOrders to orders --- */}
      <OrderTable orders={orders} />
    </div>
  )
}
