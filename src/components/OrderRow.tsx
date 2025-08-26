"use client";

import { useState } from 'react';
import { Order } from '@/types';

// [แก้ไข] ปรับปรุงฟังก์ชัน debounce ให้เป็น Generic ที่สมบูรณ์และ type-safe ที่สุด
// โดยไม่มีการใช้ 'any' เพื่อให้ผ่านกฎของ ESLint ที่เข้มงวดที่สุด
function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  delay: number
): (...args: TArgs) => Promise<TReturn> {
  let timeout: NodeJS.Timeout;
  return (...args: TArgs): Promise<TReturn> => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), delay);
    });
  };
}

// Color mapping for order statuses
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

  // Disable fields if status is not 'Pending' or 'In progress'
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
    } catch (error) {
      console.error(error);
      // Optionally, revert state on error
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };
  
  const debouncedUpdate = debounce(handleUpdate, 1000);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const isNumericField = name === 'start_count' || name === 'cost';
    
    const processedValue = isNumericField
      ? (value === '' ? null : parseFloat(value))
      : value;

    const updatePayload = { [name]: processedValue };

    // Optimistic UI update
    setOrder(prevOrder => ({ ...prevOrder, ...updatePayload }));
    
    debouncedUpdate(updatePayload);
  };

  const rowColor = statusColors[order.status ?? ''] || statusColors['Default'];

  return (
    <tr className={`transition-colors duration-300 ${rowColor}`}>
      <td className="border px-2 py-2 text-sm">{order.id}</td>
      <td className="border px-2 py-2 text-sm">{new Date(order.created_at).toLocaleString()}</td>
      <td className="border px-2 py-2 text-sm">{order.service_name}</td>
      <td className="border px-2 py-2 text-sm">
        <a 
          href={order.link ?? '#'} // Handle possible null link
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
          value={order.status ?? ''} // Handle possible null status
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
          value={order.slip_url || ''} // Handle null
          onChange={handleChange}
          className="w-full p-1 border rounded"
          disabled={isFieldDisabled}
        />
      </td>
      <td className="border px-2 py-2 text-sm">
        <textarea
          name="note"
          value={order.note || ''} // Handle null
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
