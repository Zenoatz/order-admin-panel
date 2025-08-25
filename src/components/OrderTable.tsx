'use client'

import { useState, useEffect } from 'react'
import OrderRow from './OrderRow'
import { Order } from '@/types'

export default function OrderTable() {
  // 1. สร้าง "กล่อง" สำหรับเก็บข้อมูลออเดอร์, สถานะการโหลด, และข้อผิดพลาด
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 2. useEffect จะทำงานแค่ครั้งเดียวตอนที่หน้าเว็บโหลดเสร็จ
  useEffect(() => {
    // 3. สร้างฟังก์ชันสำหรับไป "เบิกของ" (Fetch Data) จาก API
    const fetchOrders = async () => {
      try {
        setLoading(true) // เริ่มโหลด -> แสดง "Loading..."
        const response = await fetch('/api/orders')
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        const data = await response.json()
        setOrders(data) // 4. ได้ข้อมูลแล้ว -> เอาใส่กล่อง orders
      } catch (err: any) {
        setError(err.message) // 5. ถ้ามีปัญหา -> เก็บข้อความ Error ไว้
      } finally {
        setLoading(false) // 6. ไม่ว่าจะสำเร็จหรือล้มเหลว -> หยุดโหลด
      }
    }

    fetchOrders() // สั่งให้ฟังก์ชันเริ่มทำงาน
  }, []) // dependency array ว่าง หมายถึงให้ทำงานแค่ครั้งเดียว

  // 7. ส่วนของการแสดงผลตามสถานะต่างๆ
  if (loading) {
    return <div className="text-center p-8">Loading orders...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-400">Error: {error}</div>
  }

  if (orders.length === 0) {
    return <div className="text-center p-8">No orders found.</div>
  }

  // 8. ถ้าทุกอย่างเรียบร้อย -> แสดงตารางพร้อมข้อมูล
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
