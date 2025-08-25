'use client'

import { useState, ChangeEvent } from 'react'
import { Order } from '@/types'

interface OrderRowProps {
  order: Order
  onUpdate: (updatedOrder: Order) => void
}

type UpdateStatus = {
  message: string
  type: 'info' | 'success' | 'error'
} | null

// รายการสถานะทั้งหมดที่สามารถเลือกได้
const STATUS_OPTIONS = [
  'pending',
  'in_progress',
  'processing',
  'completed',
  'partial',
  'canceled',
  'error',
  'fail',
]

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
  // State สำหรับเก็บค่าในฟอร์ม
  const [startCount, setStartCount] = useState(order.start_count ?? '')
  const [cost, setCost] = useState(order.cost ?? '')
  const [slipUrl, setSlipUrl] = useState(order.slip_url || '')
  const [currentStatus, setCurrentStatus] = useState(order.status)

  // State สำหรับการแสดงผล
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null)

  const handleSave = async () => {
    setIsSubmitting(true)
    setUpdateStatus({ message: 'Saving...', type: 'info' })

    const updates = {
      id: order.id,
      order_id: order.order_id,
      start_count: startCount === '' ? null : Number(startCount),
      cost: cost === '' ? null : Number(cost),
      slip_url: slipUrl,
      status: currentStatus, // ใช้สถานะจาก dropdown
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

      // ตรวจสอบผลลัพธ์จาก Permjai
      if (result.permjaiStatus.error) {
        setUpdateStatus({
          message: `DB updated, but Permjai failed: ${result.permjaiStatus.error}`,
          type: 'error',
        })
      } else {
        setUpdateStatus({ message: 'Save successful!', type: 'success' })
      }
      onUpdate(result.data) // อัปเดต UI ด้วยข้อมูลใหม่
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.'
      console.error('Failed to save order:', error)
      setUpdateStatus({ message, type: 'error' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setUpdateStatus(null), 5000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-300'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'in_progress':
      case 'processing':
        return 'bg-blue-500/20 text-blue-300'
      case 'canceled':
      case 'error':
      case 'fail':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }
  
  const getUpdateStatusColor = () => {
    if (!updateStatus) return ''
    switch (updateStatus.type) {
      case 'info': return 'text-blue-400'
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return ''
    }
  }

  const isCompleted = order.status.toLowerCase() === 'completed';

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50">
      <td className="py-2 px-4">{order.order_id}</td>
      <td className="py-2 px-4">{order.service_name}</td>
      <td className="py-2 px-4">
        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          View
        </a>
      </td>
      <td className="py-2 px-4">{order.charge}</td>
      {/* ช่องกรอก Start Count */}
      <td className="py-2 px-4">
        <input
          type="number"
          value={startCount}
          onChange={(e) => setStartCount(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24"
          disabled={isCompleted}
        />
      </td>
      <td className="py-2 px-4">
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-24"
          disabled={isCompleted}
        />
      </td>
      <td className="py-2 px-4">{order.profit?.toFixed(2) ?? 'N/A'}</td>
      <td className="py-2 px-4">
        <input
          type="text"
          value={slipUrl}
          onChange={(e) => setSlipUrl(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded px-2 py-1 w-full"
          disabled={isCompleted}
        />
      </td>
      {/* Dropdown สำหรับเลือก Status */}
      <td className="py-2 px-4">
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className={`border rounded px-2 py-1 w-full ${getStatusColor(currentStatus)} border-gray-600 bg-gray-900`}
          disabled={isCompleted}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      </td>
      {/* ปุ่ม Save และข้อความสถานะ */}
      <td className="py-2 px-4">
        <div className="flex flex-col items-start gap-1">
          <button
            onClick={handleSave}
            disabled={isSubmitting || isCompleted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:bg-gray-500 disabled:cursor-not-allowed w-full text-center"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          {updateStatus && (
            <p className={`text-xs ${getUpdateStatusColor()}`}>
              {updateStatus.message}
            </p>
          )}
        </div>
      </td>
    </tr>
  )
}
