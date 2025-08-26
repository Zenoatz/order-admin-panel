'use client'

import { useState, useEffect } from 'react'
import { Order, OrderStatus } from '@/types'

interface OrderRowProps {
  order: Order
  onUpdate: (updatedOrder: Order) => void
}

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [startCount, setStartCount] = useState<string>(order.start_count?.toString() || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(order.status)
    setStartCount(order.start_count?.toString() || '')
  }, [order])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Processing':
        return 'bg-blue-100 text-blue-800'
      case 'Canceled':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSave = async (newStatus?: OrderStatus) => {
    const statusToUpdate = newStatus || status
    setIsSaving(true)
    setError(null)

    try {
      // ✅ คำนวณค่า remains ที่จะส่งไปอัปเดต
      // ถ้าสถานะเป็น 'Completed', remains คือ 0
      // ถ้าไม่ใช่ ให้ใช้ค่า remains เดิมของออเดอร์
      const remainsToUpdate = statusToUpdate === 'Completed' ? 0 : order.remains;

      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ เพิ่ม `remains` เข้าไปใน body ที่จะส่ง
        body: JSON.stringify({ 
            id: order.permjai_order_id, // ใช้ permjai_order_id
            status: statusToUpdate, 
            start_count: startCount ? parseInt(startCount, 10) : null,
            remains: remainsToUpdate
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order')
      }

      const result = await response.json();
      
      // อัปเดตข้อมูลใน state ของตารางด้วยข้อมูลล่าสุดจาก Supabase
      onUpdate(result.supabaseData);

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      <td className="px-4 py-3">{order.permjai_order_id}</td>
      <td className="px-4 py-3 max-w-xs truncate">
        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {order.link}
        </a>
      </td>
      <td className="px-4 py-3">{order.service_name}</td>
      <td className="px-4 py-3">{order.quantity}</td>
      <td className="px-4 py-3">{order.charge}</td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={startCount}
          onChange={(e) => setStartCount(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Start Count"
        />
      </td>
      <td className="px-4 py-3">{order.remains}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className={`text-sm rounded-lg block w-full p-2.5 ${getStatusColor(status)}`}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </td>
      <td className="px-4 py-3 flex items-center space-x-2">
        <button onClick={() => handleSave()} disabled={isSaving} className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => handleSave('Completed')} disabled={isSaving} className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400">
          Done
        </button>
        <button onClick={() => handleSave('Canceled')} disabled={isSaving} className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400">
          Cancel
        </button>
      </td>
      {error && (
        <td colSpan={9} className="text-red-500 text-center py-2">
          Error: {error}
        </td>
      )}
    </tr>
  )
}
