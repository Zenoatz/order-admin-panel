'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link' // Import Link เข้ามาใช้งาน

interface Summary {
  totalSales: number
  totalCost: number
  totalProfit: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/summary?month=${selectedDate.month}&year=${selectedDate.year}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch summary')
        }
        const data = await response.json()
        setSummary(data)
      } catch (err) {
        // **แก้ไข:** เปลี่ยนจากการใช้ `err: any` เป็นการตรวจสอบประเภทของ Error
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred.')
        }
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [selectedDate])

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setSelectedDate((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }))
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(0, i).toLocaleString('default', { month: 'long' }),
  }))

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Profit Dashboard
        </h1>

        {/* ปุ่มย้อนกลับไปหน้าหลัก */}
        <div className="flex justify-start mb-6">
          <Link href="/">
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
              &larr; Back to Order List
            </button>
          </Link>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              name="month"
              value={selectedDate.month}
              onChange={handleDateChange}
              className="bg-gray-700 border border-gray-600 rounded-md p-2"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="year">Year:</label>
            <select
              id="year"
              name="year"
              value={selectedDate.year}
              onChange={handleDateChange}
              className="bg-gray-700 border border-gray-600 rounded-md p-2"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="bg-blue-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-200">Total Sales</h2>
            <p className="text-3xl font-bold mt-2">
              {loading
                ? '...'
                : `฿${summary?.totalSales.toFixed(2) ?? '0.00'}`}
            </p>
          </div>
          <div className="bg-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-200">Total Cost</h2>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : `฿${summary?.totalCost.toFixed(2) ?? '0.00'}`}
            </p>
          </div>
          <div className="bg-green-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-200">
              Total Profit
            </h2>
            <p className="text-3xl font-bold mt-2">
              {loading
                ? '...'
                : `฿${summary?.totalProfit.toFixed(2) ?? '0.00'}`}
            </p>
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-center mt-6">Error: {error}</p>
        )}
      </div>
    </main>
  )
}
