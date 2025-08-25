import OrderTable from "@/components/OrderTable";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Order Management</h1>
        
        {/* เราจะเรียกใช้ OrderTable แบบโล่งๆ เลย ไม่ต้องส่ง props อะไรเข้าไป */}
        <OrderTable />

      </div>
    </main>
  );
}
