'use client'

import { useState, useEffect } from 'react'
import OrderRow from './OrderRow'
import { Order } from '@/types'

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )
  }

  if (loading) return <p>Loading orders...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">Order ID</th>
            <th scope="col" className="px-4 py-3">Link</th>
            <th scope="col" className="px-4 py-3">Service</th>
            <th scope="col" className="px-4 py-3">Quantity</th>
            <th scope="col" className="px-4 py-3">Charge</th>
            <th scope="col" className="px-4 py-3">Start Count</th>
            <th scope="col" className="px-4 py-3">Remains</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            // ✅ แก้ไข: นำ onUpdatePermjai ออกไป เพราะไม่ได้ใช้งานแล้ว
            <OrderRow key={order.id} order={order} onUpdate={handleUpdateOrder} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
