export interface Order {
  id: number;
  order_id: number;
  user: string; // <-- เพิ่ม user (แต่จะไม่แสดงผล)
  service_name: string;
  link: string;
  charge: number;
  start_count: number | null; // <-- เพิ่ม start_count
  cost: number | null;
  profit: number | null;
  slip_url: string | null;
  status: string;
  created_at: string;
}
