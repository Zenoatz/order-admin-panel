"use client";

import { useState, useEffect } from 'react';
import OrderRow from './OrderRow';
import { Order } from '@/types'; // นำเข้า Order type ที่เราสร้างไว้

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]); // ระบุ Type ของ state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/orders');
        const data: Order[] = await response.json(); // ระบุ Type ของ data
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  if (isLoading) {
    return <p className="text-center mt-8">Loading orders...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 border border-gray-700">
        <thead>
          <tr className="bg-gray-700">
            <th className="py-3 px-4 text-left">Order ID</th>
            <th className="py-3 px-4 text-left">Service</th>
            <th className="py-3 px-4 text-left">Link</th>
            <th className="py-3 px-4 text-left">Charge</th>
            <th className="py-3 px-4 text-left">Cost</th>
            <th className="py-3 px-4 text-left">Profit</th>
            <th className="py-3 px-4 text-left">Slip URL</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} onUpdate={handleUpdateOrder} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
