'use client';

import { useState } from 'react';
import OrderRow from './OrderRow';

// 1. เราจะเรียกข้อมูลที่ได้รับมาตอนแรกว่า `initialOrders`
const OrderTable = ({ orders: initialOrders }: { orders: any[] }) => {
  // 2. เราสร้าง "state" ขึ้นมาเพื่อเก็บข้อมูล orders โดยเอาข้อมูลเริ่มต้นมาจาก initialOrders
  // การทำแบบนี้จะทำให้เราสามารถเปลี่ยนแปลงข้อมูลในตารางได้ โดยไม่ต้องโหลดหน้าใหม่
  const [orders, setOrders] = useState(initialOrders);

  // 3. เราสร้างฟังก์ชันนี้ขึ้นมาเพื่อจัดการการอัปเดตข้อมูลใน state
  // เมื่อ OrderRow แถวใดแถวหนึ่งอัปเดตข้อมูลสำเร็จ มันจะเรียกใช้ฟังก์ชันนี้
  const handleUpdateOrder = (updatedOrder: any) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        // เราทำการวนลูปหา order ตัวเก่าที่มี id ตรงกับตัวที่เพิ่งอัปเดต
        // ถ้าเจอ ก็ให้แทนที่ด้วยข้อมูลใหม่ (updatedOrder) ถ้าไม่เจอก็ใช้ตัวเดิมไป
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Service</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Link</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Charge</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Cost</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Profit</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Slip URL</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Status</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {/* 4. เราส่งฟังก์ชัน handleUpdateOrder เป็น prop ไปให้ OrderRow ทุกแถว */}
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onOrderUpdate={handleUpdateOrder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
