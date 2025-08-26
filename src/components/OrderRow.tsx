"use client";

import { useState } from 'react';
import type { Order } from '@/types';

interface OrderRowProps {
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
  onUpdatePermjai: (orderId: number, status: 'Completed' | 'Canceled' | 'Partial') => Promise<void>;
}

export default function OrderRow({ order, onUpdate, onUpdatePermjai }: OrderRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableOrder, setEditableOrder] = useState({
    status: order.status,
    start_count: order.start_count,
    remains: order.remains,
  });
  const [isUpdatingPermjai, setIsUpdatingPermjai] = useState(false);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In progress':
        return 'bg-blue-100 text-blue-800';
      case 'Partial':
        return 'bg-purple-100 text-purple-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'Error':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...editableOrder }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update order:', response.status, errorText);
        throw new Error(`Failed to update order: ${errorText || 'Server error'}`);
      }
      
      const json = await response.json();
      if (json && json.length > 0) {
        onUpdate(json[0]);
      } else {
         // If API returns empty array, we can assume the update was successful
         // and merge local changes.
         onUpdate({ ...order, ...editableOrder });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving order:', error);
      alert(`Could not save changes. Reverting. Error: ${error instanceof Error ? error.message : String(error)}`);
      setEditableOrder({
        status: order.status,
        start_count: order.start_count,
        remains: order.remains,
      });
      setIsEditing(false);
    }
  };

  const handlePermjaiUpdateClick = async (status: 'Completed' | 'Canceled' | 'Partial') => {
    setIsUpdatingPermjai(true);
    try {
      await onUpdatePermjai(order.id, status);
      // Optionally update local state if the API call is successful
      setEditableOrder(prev => ({ ...prev, status: status }));
      onUpdate({ ...order, status: status });
    } catch (error) {
      // Error is already alerted in the parent component
    } finally {
      setIsUpdatingPermjai(false);
    }
  };

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
      <td className="px-6 py-4">{order.id}</td>
      <td className="px-6 py-4">
        <a 
          href={order.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline"
        >
          {order.link}
        </a>
      </td>
      <td className="px-6 py-4">{order.service_name || 'N/A'}</td>
      <td className="px-6 py-4">{order.charge}</td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="number"
            defaultValue={order.start_count ?? ''}
            onChange={(e) =>
              setEditableOrder({ ...editableOrder, start_count: Number(e.target.value) })
            }
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        ) : (
          order.start_count
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="number"
            defaultValue={order.remains ?? ''}
            onChange={(e) =>
              setEditableOrder({ ...editableOrder, remains: Number(e.target.value) })
            }
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        ) : (
          order.remains
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={editableOrder.status}
            onChange={(e) =>
              setEditableOrder({ ...editableOrder, status: e.target.value as Order['status'] })
            }
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="Pending">Pending</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Partial">Partial</option>
            <option value="Canceled">Canceled</option>
            <option value="Processing">Processing</option>
            <option value="Error">Error</option>
          </select>
        ) : (
          <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        )}
      </td>
      <td className="px-6 py-4">{new Date(order.created_at).toLocaleString()}</td>
      <td className="px-6 py-4 text-right space-x-2">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="font-medium text-green-600 hover:underline">Save</button>
            <button onClick={() => setIsEditing(false)} className="font-medium text-gray-600 hover:underline">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="font-medium text-blue-600 hover:underline">Edit</button>
            <button onClick={() => handlePermjaiUpdateClick('Completed')} disabled={isUpdatingPermjai} className="font-medium text-green-600 hover:underline disabled:opacity-50">
              {isUpdatingPermjai ? '...' : 'Done'}
            </button>
            <button onClick={() => handlePermjaiUpdateClick('Canceled')} disabled={isUpdatingPermjai} className="font-medium text-red-600 hover:underline disabled:opacity-50">
              {isUpdatingPermjai ? '...' : 'Cancel'}
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
