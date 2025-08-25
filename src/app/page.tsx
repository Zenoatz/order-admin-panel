import OrderTable from "@/components/OrderTable";
// 1. เปลี่ยนไป import เครื่องมือสำหรับ Server ที่เราสร้างขึ้นใหม่
import { createClient } from "@/utils/supabase/server";

// 2. ทำให้ฟังก์ชัน Home เป็น async เพื่อให้มันรอข้อมูลจากฐานข้อมูลได้
export default async function Home() {
  const supabase = createClient();

  // 3. ดึงข้อมูลบน Server ให้เสร็จก่อน แล้วเรียงจากใหม่ไปเก่า
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order('created_at', { ascending: false });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      {/* 4. ส่งข้อมูล orders ที่ได้มา ไปให้ OrderTable แสดงผล */}
      <OrderTable orders={orders || []} />
    </main>
  );
}