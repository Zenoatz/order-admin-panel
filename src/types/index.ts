export type Order = {
  id: number;
  status: string | null;
  created_at: string;
  service_name: string | null;
  link: string | null;
  quantity: number | null;
  charge: number | null;
  start_count: number | null;
  remains: number | null; // [เพิ่ม] เพิ่ม property นี้
  provider_name: string | null;
  cost: number | null;
  slip_url: string | null;
  note: string | null; // [เพิ่ม] เพิ่ม property นี้
};
