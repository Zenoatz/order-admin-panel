import { createClient } from '@/utils/supabase/server';
import OrderTable from '@/components/OrderTable';

export default async function Home() {
  // [แก้ไข] เรียกใช้ createClient โดยไม่ต้องส่ง argument
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return <p className="text-red-500">Error loading orders.</p>;
  }

  if (!orders) {
    return <p>No orders found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center sm:text-left">
            Order Management Dashboard
          </h1>
        </header>

        <div className="mt-8">
          <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
            <OrderTable orders={orders} />
          </div>
        </div>
      </div>
    </main>
  );
}
