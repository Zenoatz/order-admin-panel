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
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOrderUpdate = async (orderId: number, updates: Partial<Order>) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, ...updates } : order
      )
    );

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
    } catch (error) {
      console.error(error);
      alert('Error: Could not save changes. Reverting.');
      fetchOrders(); 
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading orders...</div>;
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white">
        {/* --- NEW HEADER STYLE --- */}
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Link</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Start Count</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Cost</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Slip URL</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        {/* --- END NEW HEADER STYLE --- */}
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onUpdate={handleOrderUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
