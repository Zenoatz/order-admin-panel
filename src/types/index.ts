export interface Order {
  id: number;
  created_at: string;
  order_id: number;
  user: string | null;
  link: string | null;
  quantity: number | null;      // <-- เพิ่มฟิลด์นี้
  service_id: number | null;    // <-- เพิ่มฟิลด์นี้
  service_name: string | null;
  status: string | null;
  start_count: number | null;
  cost: number | null;
  slip_url: string | null;
  charge: number | null;
}