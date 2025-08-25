'use client'

import { useState, ChangeEvent } from 'react'
import { Order } from '@/types'

interface OrderRowProps {
  order: Order
  onUpdate: (updatedOrder: Order) => void
}

// กำหนด type สำหรับสถานะการอัปเดต
type UpdateStatus = {
  message: string
  type: 'info' | 'success' | 'error'
} | null

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
  const [cost, setCost] = useState(order.cost ?? '')
  const [slipUrl, setSlipUrl] = useState(order.slip_url || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setUpdateStatus({ message: 'Updating...', type: 'info' })

    const updates = {
      id: order.id,
      order_id: order.order_id, // ส่ง order_id ไปด้วย
      cost: cost === '' ? null : Number(cost),
      slip_url: slipUrl,
      status: 'Completed',
    }

    try {
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update order in Supabase.')
      }

      // ตรวจสอบสถานะการอัปเดตของ Permjai จาก response
      if (result.permjaiStatus.success) {
        setUpdateStatus({ message: 'Update successful!', type: 'success' })
        onUpdate(result.data) // อัปเดต UI ด้วยข้อมูลใหม่
      } else {
        // กรณี Supabase สำเร็จ แต่ Permjai ล้มเหลว
        setUpdateStatus({
          message: `DB updated, but Permjai failed: ${result.permjaiStatus.error}`,
          type: 'error',
        })
        onUpdate(result.data) // ยังคงอัปเดต UI เพราะข้อมูลใน DB เราเปลี่ยนไปแล้ว
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.'
      console.error('Failed to update order:', error)
      setUpdateStatus({ message, type: 'error' })
    } finally {
      setIsSubmitting(false)
      // ซ่อนข้อความสถานะหลังจาก 5 วินาที
      setTimeout(() => setUpdateStatus(null), 5000)
    }
  }

  // ฟังก์ชันสำหรับเปลี่ยนสีข้อความสถานะ
  const getStatusColor = () => {
    if (!updateStatus) return ''
    switch (updateStatus.type) {
      case 'info':
        return 'text-blue-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return ''
    }
  }

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50">
      <td className="py-2 px-4">{order.order_id}</td>
      <td className="py-2 px-4">{order.service_name}</td>
      <td className="py-2 px-4">
        <a
          href={order.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          View Link
        </a>
      </td>
      <td className="py-2 px-4">{order.charge}</td>
      <td className="py-2 px-4">
        <input
          type="number"
          value={cost}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCost(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24"
          disabled={order.status === 'Completed'}
        />
      </td>
      <td className="py-2 px-4">{order.profit?.toFixed(2) ?? 'N/A'}</td>
      <td className="py-2 px-4">
        <input
          type="text"
          value={slipUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSlipUrl(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-full"
          disabled={order.status === 'Completed'}
        />
      </td>
      <td className="py-2 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            order.status === 'Completed'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-yellow-500/20 text-yellow-300'
          }`}
        >
          {order.status}
        </span>
      </td>
      <td className="py-2 px-4">
        {order.status !== 'Completed' ? (
          <div className="flex flex-col items-start gap-1">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:bg-gray-500 w-full text-center"
            >
              {isSubmitting ? 'Saving...' : 'Confirm'}
            </button>
            {updateStatus && (
              <p className={`text-xs ${getStatusColor()}`}>
                {updateStatus.message}
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">Done</span>
        )}
      </td>
    </tr>
  )
}
