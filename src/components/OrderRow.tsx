"use client";

import { useState } from 'react';
import { Order } from '@/types';

// [แก้ไข] ปรับปรุงฟังก์ชัน debounce ให้ใช้ unknown[] แทน any[] เพื่อให้ผ่าน ESLint
const debounce = <F extends (...args: unknown[]) => void>(func: F, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// สร้าง Map ของสีสำหรับแต่ละสถานะเพื่อให้จัดการง่ายและดูสบายตา
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

  // Logic การ disabled ช่อง input
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
      // ไม่ต้อง setOrder ที่นี่อีก เพราะ state ถูกอัปเดตแบบ optimistic ใน handleChange แล้ว
    } catch (error) {
      console.error(error);
      // หาก error ควร revert state กลับไปเป็นค่าเดิม (optional)
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };
  
  const debouncedUpdate = debounce(handleUpdate, 1000);

  // แก้ไข handleChange ให้จัดการ Type ของตัวเลขได้ถูกต้อง
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // ตรวจสอบว่าเป็น field ที่ควรเป็นตัวเลขหรือไม่
    const isNumericField = name === 'start_count' || name === 'cost';
    
    // แปลงค่า ถ้าเป็น field ตัวเลข: ถ้าค่าเป็นสตริงว่างให้เป็น null, มิฉะนั้นแปลงเป็นตัวเลข
    // ถ้าไม่ใช่ field ตัวเลข: ใช้ค่า value เดิม
    const processedValue = isNumericField
      ? (value === '' ? null : parseFloat(value))
      : value;

    const updatePayload = { [name]: processedValue };

    // อัปเดต state ในหน้าจอทันทีเพื่อให้ผู้ใช้เห็นการเปลี่ยนแปลง (Optimistic Update)
    setOrder(prevOrder => ({ ...prevOrder, ...updatePayload }));
    
    // เรียกใช้ฟังก์ชันบันทึกข้อมูลแบบหน่วงเวลา
    debouncedUpdate(updatePayload);
  };

  const rowColor = statusColors[order.status] || statusColors['Default'];

  return (
    <tr className={`transition-colors duration-300 ${rowColor}`}>
      <td className="border px-2 py-2 text-sm">{order.id}</td>
      <td className="border px-2 py-2 text-sm">{new Date(order.created_at).toLocaleString()}</td>
      <td className="border px-2 py-2 text-sm">{order.service_name}</td>
      <td className="border px-2 py-2 text-sm">
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
          // ใช้ ?? '' เพื่อให้แสดงค่า 0 ได้อย่างถูกต้อง และจัดการค่า null
          value={order.start_count ?? ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled}
        />
      </td>
      <td className="border px-2 py-2 text-sm">{order.remains}</td>
      <td className="border px-2 py-2 text-sm">
        <input
          type="number"
          step="0.01"
          name="cost"
          // ใช้ ?? '' เพื่อให้แสดงค่า 0 ได้อย่างถูกต้อง และจัดการค่า null
          value={order.cost ?? ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled}
        />
      </td>
      <td className="border px-2 py-2 text-sm">
        <input
          type="text"
          name="slip_url"
          value={order.slip_url || ''}
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled}
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
