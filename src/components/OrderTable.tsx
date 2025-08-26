'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import OrderRow from './OrderRow';

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // ตั้งค่าให้ดึงข้อมูลใหม่ทุกๆ 30 วินาที
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // แก้ไข: ปรับปรุงฟังก์ชัน handleOrderUpdate ให้รับพารามิเตอร์ 2 ตัว
  // คือ orderId และ updates เพื่อให้ตรงกับที่ OrderRow ส่งมา
  const handleOrderUpdate = async (orderId: number, updates: Partial<Order>) => {
    // 1. อัปเดต State ของหน้าเว็บทันทีเพื่อ UX ที่ดี
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, ...updates } : order
      )
    );

    // 2. ส่ง request ไปยัง API เพื่อบันทึกข้อมูลลงฐานข้อมูลจริงๆ
    try {
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order on server');
      }
      
      // (Optional) อาจจะ fetch ข้อมูลทั้งหมดใหม่อีกครั้งหลังบันทึกสำเร็จ
      // เพื่อให้แน่ใจว่าข้อมูลตรงกัน 100%
      // await fetchOrders();

    } catch (error) {
      console.error(error);
      // หากการบันทึกล้มเหลว ควร revert State กลับไปเป็นเหมือนเดิม
      // หรือแจ้งเตือนผู้ใช้
      alert('Error: Could not save changes to the server.');
      fetchOrders(); // ดึงข้อมูลจริงจาก server มาทับ
    }
  };


  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Count</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slip URL</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            // ส่ง handleOrderUpdate ที่แก้ไขแล้วเข้าไป
            <OrderRow key={order.id} order={order} onUpdate={handleOrderUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
