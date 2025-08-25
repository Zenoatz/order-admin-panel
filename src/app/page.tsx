'use client'

import OrderTable from '@/components/OrderTable'
import Link from 'next/link'

export default function Home() {
  // ฟังก์ชันสำหรับรีเฟรชหน้าเว็บ
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
          Order Management
        </h1>

        {/* Container สำหรับปุ่ม Navigation */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <Link href="/dashboard">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
              Go to Dashboard
            </button>
          </Link>
          <button
            onClick={handleRefresh}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Refresh Data
          </button>
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
          <OrderTable />
        </div>
      </div>
    </main>
  )
}
