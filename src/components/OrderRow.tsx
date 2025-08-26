"use client";

import { useState, useEffect } from 'react';
import { Order } from '@/types';

// ฟังก์ชันสำหรับ debounce การเรียก API
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// [แก้ไข] สร้าง Map ของสีสำหรับแต่ละสถานะเพื่อให้จัดการง่ายและดูสบายตา
const statusColors: { [key: string]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Partial': 'bg-purple-100 text-purple-800',
  'Canceled': 'bg-red-100 text-red-800',
  'Default': 'bg-gray-100 text-gray-800',
};


export default function OrderRow({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [isSaving, setIsSaving] = useState(false);

  // [แก้ไข] Logic การ disabled ช่อง input
  // จะ disable เมื่อสถานะไม่ใช่ 'Pending' หรือ 'In progress'
  const isFieldDisabled = order.status !== 'Pending' && order.status !== 'In progress';

  const handleUpdate = async (updatedFields: Partial<Order>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...updatedFields }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      // อัปเดต state ด้วยข้อมูลใหม่หลังจากบันทึกสำเร็จ
      setOrder(prevOrder => ({ ...prevOrder, ...updatedFields }));
    } catch (error) {
      console.error(error);
      // ควรมีการแจ้งเตือนผู้ใช้ว่าการบันทึกล้มเหลว
    } finally {
      // หน่วงเวลาเล็กน้อยเพื่อให้ผู้ใช้เห็นสถานะ "Saving..."
      setTimeout(() => setIsSaving(false), 500);
    }
  };
  
  // สร้าง debounced version ของ handleUpdate
  const debouncedUpdate = debounce(handleUpdate, 1000); // 1 วินาที

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedOrder = { ...order, [name]: value };
    setOrder(updatedOrder);
    debouncedUpdate({ [name]: value });
  };

  // [แก้ไข] เลือกสีของแถวตามสถานะปัจจุบัน
  const rowColor = statusColors[order.status] || statusColors['Default'];

  return (
    <tr className={`transition-colors duration-300 ${rowColor}`}>
      <td className="border px-2 py-2 text-sm">{order.id}</td>
      <td className="border px-2 py-2 text-sm">{new Date(order.created_at).toLocaleString()}</td>
      <td className="border px-2 py-2 text-sm">{order.service_name}</td>
      <td className="border px-2 py-2 text-sm">
        {/* [แก้ไข] ทำให้ Link สามารถคลิกได้ */}
        <a 
          href={order.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {order.link}
        </a>
      </td>
      <td className="border px-2 py-2 text-sm">{order.quantity}</td>
      <td className="border px-2 py-2 text-sm">
        <select
          name="status"
          value={order.status}
          onChange={handleChange}
          className="w-full p-1 border rounded bg-white"
        >
          <option value="Pending">Pending</option>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
          <option value="Partial">Partial</option>
          <option value="Canceled">Canceled</option>
        </select>
      </td>
      <td className="border px-2 py-2 text-sm">
        <input
          type="number"
          name="start_count"
          value={order.start_count || ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled} // [แก้ไข] ใช้ Logic ใหม่
        />
      </td>
      <td className="border px-2 py-2 text-sm">{order.remains}</td>
      <td className="border px-2 py-2 text-sm">
        <input
          type="number"
          step="0.01"
          name="cost"
          value={order.cost || ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled} // [แก้ไข] ใช้ Logic ใหม่
        />
      </td>
      <td className="border px-2 py-2 text-sm">
        <input
          type="text"
          name="slip_url"
          value={order.slip_url || ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled} // [แก้ไข] ใช้ Logic ใหม่
        />
      </td>
      <td className="border px-2 py-2 text-sm">
        <textarea
          name="note"
          value={order.note || ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          rows={1}
        />
      </td>
      <td className="border px-2 py-2 text-sm text-center">
        {isSaving ? 'Saving...' : 'Saved'}
      </td>
    </tr>
  );
}
