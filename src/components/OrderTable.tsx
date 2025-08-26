"use client";

import { useState } from 'react';
import { Order } from '@/types';
import OrderRow from './OrderRow';

export default function OrderTable({ orders: initialOrders }: { orders: Order[] }) {
  // ไม่จำเป็นต้องใช้ setOrders แล้ว เพราะแต่ละแถวจัดการ state ของตัวเอง
  const [orders] = useState(initialOrders);

  // [ลบ] ฟังก์ชันนี้ไม่จำเป็นอีกต่อไป เพราะ OrderRow จัดการการอัปเดตเอง
  // const handleUpdateOrder = (orderId: number, updates: Partial<Order>) => {
  //   setOrders(currentOrders =>
  //     currentOrders.map(order =>
  //       order.id === orderId ? { ...order, ...updates } : order
  //     )
  //   );
  // };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Order ID</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2">Link</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Start Count</th>
            <th className="border px-4 py-2">Remains</th>
            <th className="border px-4 py-2">Cost</th>
            <th className="border px-4 py-2">Slip URL</th>
            <th className="border px-4 py-2">Note</th>
            <th className="border px-4 py-2">Save Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              // [ลบ] ลบ prop ที่ไม่ได้ใช้ออก
              // onUpdate={handleUpdateOrder} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
