// src/app/dashboard/page.tsx

"use client"; // บอก Next.js ว่าหน้านี้เป็น Client Component

import { useState, useEffect, FormEvent } from 'react';

// สร้าง Interface เพื่อกำหนดชนิดข้อมูลของ state summary
interface SummaryData {
  totalCharge: number;
  totalCost: number;
  totalProfit: number;
}

export default function DashboardPage() {
  // --- 1. State Variables ---
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // --- 2. ฟังก์ชันสำหรับดึงข้อมูลสรุป ---
  const fetchSummary = async (selectedYear: number, selectedMonth: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/summary?year=${selectedYear}&month=${selectedMonth}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: SummaryData = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setSummary(null); // เคลียร์ข้อมูลเก่าถ้ามี error
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. useEffect: ให้ดึงข้อมูลครั้งแรกเมื่อหน้าเว็บโหลด ---
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    fetchSummary(currentYear, currentMonth);
  }, []); // [] หมายถึงให้ทำแค่ครั้งเดียวตอนเริ่มต้น

  // --- 4. ฟังก์ชันเมื่อกดปุ่ม "ดูสรุป" ---
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // ป้องกันหน้าเว็บรีโหลด
    fetchSummary(year, month);
  };

  // --- 5. สร้างตัวเลือกปี (5 ปี ย้อนหลัง) ---
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const monthOptions = [
    { value: 1, label: 'มกราคม' }, { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' }, { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' }, { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' }, { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' }, { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' }, { value: 12, label: 'ธันวาคม' },
  ];

  // --- 6. ส่วนแสดงผล (UI) ---
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Profit Dashboard</h1>

      {/* ฟอร์มสำหรับเลือกเดือน/ปี */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 flex items-end gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">เลือกปี</label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-1">เลือกเดือน</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
          ดูสรุป
        </button>
      </form>

      {/* ส่วนแสดงผลลัพธ์ */}
      <div className="w-full max-w-4xl">
        {isLoading ? (
          <p className="text-center text-xl">กำลังโหลดข้อมูล...</p>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-700 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold text-green-200">ยอดขายทั้งหมด</h2>
              <p className="text-4xl font-bold mt-2">฿{summary.totalCharge.toLocaleString()}</p>
            </div>
            <div className="bg-red-700 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold text-red-200">ต้นทุนทั้งหมด</h2>
              <p className="text-4xl font-bold mt-2">฿{summary.totalCost.toLocaleString()}</p>
            </div>
            <div className="bg-blue-700 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold text-blue-200">กำไรสุทธิ</h2>
              <p className="text-4xl font-bold mt-2">฿{summary.totalProfit.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xl text-yellow-500">ไม่พบข้อมูลสำหรับเดือนที่เลือก</p>
        )}
      </div>
    </main>
  );
}