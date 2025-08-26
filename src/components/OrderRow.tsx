'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/types';

interface OrderRowProps {
  order: Order;
  onUpdate: (orderId: number, updates: Partial<Order>) => void;
}

export default function OrderRow({ order, onUpdate }: OrderRowProps) {
  // State ภายในสำหรับจัดการค่าในฟอร์มของแต่ละแถว
  const [currentStatus, setCurrentStatus] = useState(order.status || 'Pending');
  const [startCount, setStartCount] = useState(order.start_count?.toString() || '');
  const [cost, setCost] = useState(order.cost?.toString() || '');
  const [slipUrl, setSlipUrl] = useState(order.slip_url || '');
  const [isSaving, setIsSaving] = useState(false);

  // คำนวณ isCompleted ด้วย useMemo เพื่อให้ค่าอัปเดตตาม order.status ที่เปลี่ยนไปเสมอ
  // ป้องกันปัญหาที่ฟอร์มถูก disable ค้างแม้ข้อมูลจะเปลี่ยนไปแล้ว
  const isCompleted = useMemo(() => {
    const completedStatuses = ['Completed', 'Partial', 'Canceled'];
    // ตรวจสอบสถานะของ order ที่มาจาก props โดยตรงเพื่อให้ข้อมูลเป็นปัจจุบันที่สุด
    return completedStatuses.includes(order.status || '');
  }, [order.status]);

  // ใช้ useEffect เพื่อซิงค์ state ภายในกับ props ที่อาจเปลี่ยนแปลงจากภายนอก
  // เมื่อมีการ refresh ข้อมูล state ของแถวนี้ก็จะอัปเดตตามไปด้วย
  useEffect(() => {
    setCurrentStatus(order.status || 'Pending');
    setStartCount(order.start_count?.toString() || '');
    setCost(order.cost?.toString() || '');
    setSlipUrl(order.slip_url || '');
  }, [order]);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: Partial<Order> = {
      status: currentStatus,
      start_count: startCount ? parseInt(startCount, 10) : null,
      cost: cost ? parseFloat(cost) : null,
      slip_url: slipUrl || null,
    };

    try {
      // เรียกฟังก์ชัน onUpdate ที่ส่งมาจาก parent (OrderTable) เพื่อส่งข้อมูลไปอัปเดต
      await onUpdate(order.order_id, updates);
    } catch (error) {
      console.error('Failed to update order:', error);
      // สามารถเพิ่มการแจ้งเตือนผู้ใช้ตรงนี้ได้หากการบันทึกล้มเหลว
    } finally {
      setIsSaving(false);
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสีพื้นหลังของแถวตามสถานะ
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100';
      case 'In progress':
        return 'bg-blue-100';
      case 'Completed':
        return 'bg-green-100';
      case 'Partial':
        return 'bg-purple-100';
      case 'Canceled':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <tr className={`border-b border-gray-200 ${getStatusColor(order.status)}`}>
      <td className="px-4 py-2 text-sm text-gray-700">{order.order_id}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{order.user}</td>
      <td className="px-4 py-2 text-sm text-gray-700 break-all">{order.link}</td>
      {/* แสดงผล quantity ซึ่งตอนนี้มีข้อมูลส่งมาจาก Backend แล้ว หลังจากที่คุณเพิ่มคอลัมน์ */}
      <td className="px-4 py-2 text-sm text-gray-700">{order.quantity}</td>
      <td className="px-4 py-2 text-sm text-gray-700">{order.service_name}</td>
      <td className="px-4 py-2">
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          // Input จะถูก disabled ก็ต่อเมื่อ isCompleted เป็น true เท่านั้น
          disabled={isCompleted}
          className="w-full p-1 border rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          <option value="Pending">Pending</option>
          <option value="In progress">In progress</option>
          <option value="Completed">Completed</option>
          <option value="Partial">Partial</option>
          <option value="Canceled">Canceled</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={startCount}
          onChange={(e) => setStartCount(e.target.value)}
          disabled={isCompleted}
          className="w-full p-1 border rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
          placeholder="Start Count"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          disabled={isCompleted}
          className="w-full p-1 border rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
          placeholder="Cost"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={slipUrl}
          onChange={(e) => setSlipUrl(e.target.value)}
          disabled={isCompleted}
          className="w-full p-1 border rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
          placeholder="Slip URL"
        />
      </td>
      <td className="px-4 py-2 text-center">
        <button
          onClick={handleSave}
          // ปุ่มจะถูก disable เมื่อ isCompleted เป็น true หรือกำลังอยู่ในสถานะ saving
          disabled={isCompleted || isSaving}
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
}