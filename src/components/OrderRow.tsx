'use client';

import { useState } from 'react';

// 1. กำหนด "หน้าตา" ของ props ที่จะรับเข้ามาให้ชัดเจนขึ้น
// ตอนนี้มันต้องรับ order (ข้อมูล) และ onOrderUpdate (ฟังก์ชัน)
interface OrderRowProps {
  order: any;
  onOrderUpdate: (updatedOrder: any) => void;
}

const OrderRow = ({ order, onOrderUpdate }: OrderRowProps) => {
  // State สำหรับเก็บค่าในช่อง input
  const [cost, setCost] = useState(order.cost || '');
  const [slipUrl, setSlipUrl] = useState(order.slip_url || '');

  // 2. State ใหม่สำหรับจัดการสถานะ "กำลังโหลด" ของปุ่ม
  const [isUpdating, setIsUpdating] = useState(false);

  // 3. นี่คือหัวใจหลัก! ฟังก์ชันที่ทำงานเมื่อกดปุ่ม Update
  const handleUpdate = async () => {
    setIsUpdating(true); // เริ่มต้นสถานะโหลด (ปุ่มจะถูก disable)

    const payload = {
      id: order.id,
      cost: parseFloat(cost) || 0, // แปลง cost เป็นตัวเลข ถ้ากรอกผิดให้เป็น 0
      slip_url: slipUrl,
      status: 'Completed', // เราจะเปลี่ยนสถานะเป็น 'Completed' เสมอเมื่อกดปุ่มนี้
    };

    try {
      // ยิง fetch ไปที่ API ของเราด้วยเมธอด POST
      const response = await fetch('/api/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // แปลงข้อมูลเป็น JSON string เพื่อส่งไป
      });

      if (!response.ok) {
        // ถ้า API ตอบกลับมาว่ามีปัญหา ให้โยน error ออกไป
        throw new Error('Failed to update the order.');
      }

      // 4. ถ้าสำเร็จ API จะส่งข้อมูลที่อัปเดตแล้วกลับมา
      const updatedOrderArray = await response.json();
      if (updatedOrderArray && updatedOrderArray.length > 0) {
        // 5. เราเรียกใช้ฟังก์ชัน onOrderUpdate ที่ได้รับมาจาก OrderTable
        // เพื่อส่งข้อมูลใหม่กลับไปให้ "ผู้จัดการ" ของเราอัปเดตตาราง
        onOrderUpdate(updatedOrderArray[0]);
      }

    } catch (error) {
      console.error('Update failed:', error);
      // ในแอปจริง เราอาจจะแสดงข้อความแจ้งเตือนผู้ใช้ตรงนี้
    } finally {
      setIsUpdating(false); // จบการโหลด (ปุ่มจะกลับมาใช้งานได้)
    }
  };

  // คำนวณกำไรแบบ real-time
  const profit = !isNaN(parseFloat(order.charge)) && !isNaN(parseFloat(cost))
    ? parseFloat(order.charge) - parseFloat(cost)
    : 0;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-100">
      <td className="py-3 px-4">{order.order_id}</td>
      <td className="py-3 px-4">{order.service_name}</td>
      <td className="py-3 px-4">
        <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Link
        </a>
      </td>
      <td className="py-3 px-4">{order.charge}</td>
      <td className="py-3 px-4">
        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-24 p-1 border rounded"
          placeholder="0.00"
        />
      </td>
      <td className="py-3 px-4">
        {profit.toFixed(2)}
      </td>
      <td className="py-3 px-4">
        <input
          type="text"
          value={slipUrl}
          onChange={(e) => setSlipUrl(e.target.value)}
          className="w-full p-1 border rounded"
          placeholder="https://..."
        />
      </td>
      <td className="py-3 px-4">
        {/* เพิ่ม Style ให้กับ Status เพื่อให้ดูง่ายขึ้น */}
        <span
          className={`py-1 px-3 rounded-full text-xs ${
            order.status === 'Completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
          }`}
        >
          {order.status}
        </span>
      </td>
      <td className="py-3 px-4">
        {/* 6. ปุ่มของเราจะเปลี่ยนข้อความและถูก disable ขณะที่กำลังอัปเดต */}
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </td>
    </tr>
  );
};

export default OrderRow;
