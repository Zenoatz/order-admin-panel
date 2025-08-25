// src/components/OrderTable.tsx
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
        setError(null) // เคลียร์ error เก่าทิ้งทุกครั้งที่เริ่มดึงข้อมูลใหม่
        const response = await fetch('/api/orders')
        const data = await response.json() // อ่านข้อมูล JSON ออกมาก่อนเสมอ

        // ตรวจสอบว่าการเรียก API สำเร็จหรือไม่ จากค่า response.ok
        if (!response.ok) {
          // ถ้าไม่สำเร็จ, 'data' ที่ได้มาน่าจะมี object { error: '...' }
          // เราจะใช้ข้อความนั้นมาแสดงผลเพื่อบอกสาเหตุที่ชัดเจนขึ้น
          throw new Error(data.error || 'Failed to fetch orders')
        }

        // ถ้าสำเร็จ, ตรวจสอบอีกชั้นเพื่อความปลอดภัยว่าข้อมูลที่ได้เป็น Array จริงๆ
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          // กรณีนี้ไม่ควรเกิดขึ้นถ้า API เราถูกต้อง แต่เป็นการป้องกันไว้ก่อน
          throw new Error('Received data is not in the expected format.')
        }

      } catch (err: any) {
        setError(err.message) // เก็บข้อความ Error ที่เกิดขึ้นไว้
      } finally {
        setLoading(false) // หยุดการโหลดเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
      }
    }

    fetchOrders()
  }, [])

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
            <OrderRow key={order.id} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
