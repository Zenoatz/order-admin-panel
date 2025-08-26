import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('id', { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching orders for home page:", error)
  }

  // ... a lot of code ...
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome to the Order Admin Panel
        </h1>
        <p className="text-center text-gray-600">
          This is a simple dashboard to view and manage recent orders.
        </p>
        <div className="text-center">
          <Link href="/dashboard" className="inline-block px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              Go to Dashboard
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
