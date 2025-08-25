"use client";

import { useState, ChangeEvent } from 'react';
import { Order } from '@/types'; // นำเข้า Order type ที่เราสร้างไว้

// กำหนด Type ของ Props ที่จะรับเข้ามา
interface OrderRowProps {
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
}

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
  const [cost, setCost] = useState(order.cost || '');
  const [slipUrl, setSlipUrl] = useState(order.slip_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const updates = {
      id: order.id,
      cost: cost === '' ? null : Number(cost),
      slip_url: slipUrl,
      status: 'Completed',
    };

    try {
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedOrder: Order = await response.json();
      onUpdate(updatedOrder);
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50">
      <td className="py-2 px-4">{order.order_id}</td>
      <td className="py-2 px-4">{order.service_name}</td>
      <td className="py-2 px-4"><a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Link</a></td>
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
      <td className="py-2 px-4">{order.profit}</td>
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
        <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'Completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {order.status}
        </span>
      </td>
      <td className="py-2 px-4">
        {order.status !== 'Completed' && (
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:bg-gray-500"
          >
            {isSubmitting ? 'Saving...' : 'Confirm'}
          </button>
        )}
      </td>
    </tr>
  );
}
