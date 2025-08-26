"use client";

import { useState, useEffect } from 'react';
import OrderRow from './OrderRow';
import type { Order } from '@/types';

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  };

  const handleUpdatePermjai = async (orderId: number, status: 'Completed' | 'Canceled' | 'Partial') => {
    try {
      const response = await fetch('/api/update-permjai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status on Permjai');
      }

      alert(`Order ${orderId} status updated to ${status} on Permjai successfully!`);
      // The local state will be updated via polling or can be updated here if needed
      const updatedOrder = orders.find(o => o.id === orderId);
      if (updatedOrder) {
        handleUpdateOrder({ ...updatedOrder, status });
      }

    } catch (error) {
      console.error('Error updating Permjai status:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error; // re-throw to be caught in OrderRow
    }
  };


  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Order ID</th>
            <th scope="col" className="px-6 py-3">Link</th>
            <th scope="col" className="px-6 py-3">Service</th>
            <th scope="col" className="px-6 py-3">Charge</th>
            <th scope="col" className="px-6 py-3">Start Count</th>
            <th scope="col" className="px-6 py-3">Remains</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Created At</th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="text-center p-4">Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="text-center p-4 text-red-500">{error}</td>
            </tr>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <OrderRow key={order.id} order={order} onUpdate={handleUpdateOrder} onUpdatePermjai={handleUpdatePermjai} />
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center p-4">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
