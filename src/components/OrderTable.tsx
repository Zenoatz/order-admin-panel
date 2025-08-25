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
        setError(null)
        const response = await fetch('/api/orders')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders')
        }

        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          throw new Error('Received data is not in the expected format.')
        }
      } catch (err) {
        // **แก้ไข:** เปลี่ยนจากการใช้ `err: any` เป็นการตรวจสอบประเภทของ Error
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )
  }

  if (loading) {
    return <div className="text-center p-8">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">Error: {error}</div>
  }

  if (orders.length === 0) {
    return <div className="text-center p-8">No orders found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 text-white">
        <thead>
          <tr className="bg-gray-700">
            <th className="py-3 px-4 text-left">Order ID</th>
            <th className="py-3 px-4 text-left">Service</th>
            <th className="py-3 px-4 text-left">Link</th>
            <th className="py-3 px-4 text-left">Charge</th>
            <th className="py-3 px-4 text-left">Cost</th>
            <th className="py-3 px-4 text-left">Profit</th>
            <th className="py-3 px-4 text-left">Slip URL</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onUpdate={handleOrderUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
